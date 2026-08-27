import type { Page } from '@playwright/test';
import { test, expect, ACCESS_TOKEN_KEY, USER_KEY } from './fixtures/auth';
import { testUser } from './fixtures/test-data';
import { signUpViaApi } from './fixtures/api';

// Asserts the UI reflects a logged-in session, then checks past the UI into the underlying
// storage — the header text alone wouldn't catch a broken/missing token or user record.
async function expectLoggedInSession(
  page: Page,
  user: { displayName: string; email: string },
): Promise<void> {
  await expect(page.locator('.app-header__user')).toHaveText(user.displayName);
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

  const session = await page.evaluate(
    ({ tokenKey, userKey }) => ({
      accessToken: localStorage.getItem(tokenKey),
      user: localStorage.getItem(userKey),
    }),
    { tokenKey: ACCESS_TOKEN_KEY, userKey: USER_KEY },
  );

  expect(session.accessToken?.split('.')).toHaveLength(3); // JWT shape: header.payload.signature
  expect(JSON.parse(session.user ?? '{}')).toMatchObject({
    displayName: user.displayName,
    email: user.email,
  });
}

// Asserts a rejected auth attempt left the user right where they were, with no session created.
async function expectStillLoggedOut(page: Page, path: string): Promise<void> {
  await expect(page).toHaveURL(path);
  await expect(page.getByRole('link', { name: 'Sign in' }).first()).toBeVisible();
  const accessToken = await page.evaluate((key) => localStorage.getItem(key), ACCESS_TOKEN_KEY);
  expect(accessToken).toBeNull();
}

test.describe('Signup', () => {
  test('creates an account and logs the user in', async ({ page }) => {
    const user = testUser('Signup Journey');

    await page.goto('/signup');
    await page.getByLabel('Name').fill(user.displayName);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign up' }).click();

    // Signup redirects to the home page once the session is established.
    await page.waitForURL('/');
    await expectLoggedInSession(page, user);
  });

  test('rejects a duplicate email', async ({ page }) => {
    const existing = testUser('Duplicate Email');
    await signUpViaApi(existing); // pre-create the account; no UI or session involved

    await page.goto('/signup');
    await page.getByLabel('Name').fill('Someone Else');
    await page.getByLabel('Email').fill(existing.email);
    await page.getByLabel('Password').fill('anothersecret123');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByText('That email is already registered.')).toBeVisible();
    await expectStillLoggedOut(page, '/signup');
  });
});

test.describe('Login', () => {
  test('with valid credentials logs the user in', async ({ page }) => {
    const user = testUser('Login Journey');
    await signUpViaApi(user); // pre-create the account; no UI or session involved

    await page.goto('/signin');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Login redirects to the home page once the session is established.
    await page.waitForURL('/');
    await expectLoggedInSession(page, user);
  });

  test('rejects a wrong password', async ({ page }) => {
    const user = testUser('Wrong Password');
    await signUpViaApi(user);

    await page.goto('/signin');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill('not-the-right-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Incorrect email or password.')).toBeVisible();
    await expectStillLoggedOut(page, '/signin');
  });

  test('rejects an unknown email', async ({ page }) => {
    const unknownEmail = testUser('Unknown Email').email;

    await page.goto('/signin');
    await page.getByLabel('Email').fill(unknownEmail);
    await page.getByLabel('Password').fill('whatever123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Incorrect email or password.')).toBeVisible();
    await expectStillLoggedOut(page, '/signin');
  });
});
