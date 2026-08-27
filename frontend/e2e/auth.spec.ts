import { test, expect, ACCESS_TOKEN_KEY, USER_KEY } from './fixtures/auth';
import { testUser } from './fixtures/test-data';

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
    await expect(page.locator('.app-header__user')).toHaveText(user.displayName);
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

    // The account isn't just "created" — the returned session is what's driving the UI above,
    // so also assert the underlying storage directly to prove signup really did log them in.
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
  });
});
