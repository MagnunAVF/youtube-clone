import { test, expect, ACCESS_TOKEN_KEY, USER_KEY } from './fixtures/auth';
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

  test('shows an error and logs the user out when the session is expired/invalid', async ({
    page,
    expiredSessionUser,
  }) => {
    await page.goto('/upload');
    // The bogus token still looks logged-in client-side, so the header and form render normally.
    await expect(page.locator('.app-header__user')).toHaveText(expiredSessionUser.displayName);
    await expect(page.getByLabel('Title')).toBeVisible();

    await page.getByLabel('Title').fill(uniqueTitle('Expired Session Upload'));
    await page.getByLabel('Video file').setInputFiles(SAMPLE_VIDEO_PATH);
    await page.getByRole('button', { name: 'Upload' }).click();

    await expect(page.getByText('Your session expired. Please sign in again.')).toBeVisible();

    // Reverts to the logged-out gate view.
    await expect(page.getByText('to upload a video.')).toBeVisible();
    await expect(page.getByLabel('Title')).toHaveCount(0);

    const session = await page.evaluate(
      ({ tokenKey, userKey }) => ({
        accessToken: localStorage.getItem(tokenKey),
        user: localStorage.getItem(userKey),
      }),
      { tokenKey: ACCESS_TOKEN_KEY, userKey: USER_KEY },
    );
    expect(session.accessToken).toBeNull();
    expect(session.user).toBeNull();
  });
});
