import { test, expect } from './fixtures/auth';
import { uniqueTitle } from './fixtures/test-data';
import { SAMPLE_VIDEO_PATH } from './fixtures/video';

test.describe('Video upload', () => {
  test('succeeds for a logged-in user and appears in the list', async ({ page, signedInUser }) => {
    const title = uniqueTitle('E2E Upload');

    await page.goto('/upload');
    await page.getByLabel('Title').fill(title);
    await page.getByLabel('Description').fill('Uploaded by the video upload e2e test');
    await page.getByLabel('Video file').setInputFiles(SAMPLE_VIDEO_PATH);
    await page.getByRole('button', { name: 'Upload' }).click();

    await expect(page.getByText(`Uploaded "${title}"`)).toBeVisible();

    await page.goto('/');
    const card = page.locator('.video-card', { hasText: title });
    await expect(card).toBeVisible();
    await expect(card.locator('.video-card__uploader')).toHaveText(signedInUser.displayName);
  });

  test('gates behind sign-in when logged out', async ({ page }) => {
    await page.goto('/upload');

    await expect(page.getByText('to upload a video.')).toBeVisible();
    await expect(page.getByLabel('Title')).toHaveCount(0);

    const gateSignInLink = page.getByRole('link', { name: 'Sign in' }).last();
    await expect(gateSignInLink).toHaveAttribute('href', '/signin');

    await gateSignInLink.click();
    await expect(page).toHaveURL('/signin');
  });
});
