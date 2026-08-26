import { test, expect } from './fixtures/auth';
import { SAMPLE_VIDEO_PATH } from './fixtures/video';

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

  test('the sample video fixture uploads successfully', async ({ page, signedInUser }) => {
    void signedInUser; // ensures the session is seeded before navigation
    await page.goto('/upload');
    await page.getByLabel('Title').fill('Fixture Smoke Test');
    await page.getByLabel('Video file').setInputFiles(SAMPLE_VIDEO_PATH);
    await page.getByRole('button', { name: 'Upload' }).click();
    await expect(page.getByText(/Uploaded "Fixture Smoke Test"/)).toBeVisible();
  });
});
