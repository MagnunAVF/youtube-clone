import { test, expect } from './fixtures/auth';

test.describe('Playwright setup', () => {
  test('the app loads and shows the logged-out header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test('the signedInUser fixture seeds a real, working session', async ({ page, signedInUser }) => {
    await page.goto('/');
    await expect(page.locator('.app-header__user')).toHaveText(signedInUser.displayName);
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });
});
