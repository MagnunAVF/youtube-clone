import { test, expect } from '@playwright/test';
import { ACCESS_TOKEN_KEY } from './fixtures/auth';
import { signUpViaApi, uploadVideoViaApi } from './fixtures/api';
import { testUser, uniqueTitle } from './fixtures/test-data';
import { SAMPLE_VIDEO_PATH } from './fixtures/video';

// Uses the plain (non-auth) Playwright test - no session is ever seeded on `page`, so a
// passing test here proves these pages truly work for a logged-out visitor, not just that
// nothing in the fixtures happened to log one in.
test.describe('Public viewing', () => {
  test(
    'video list and watch pages are accessible without logging in',
    { tag: '@journey' },
    async ({ page }) => {
      const uploader = testUser('Public Viewing Uploader');
      const { accessToken } = await signUpViaApi(uploader);
      const title = uniqueTitle('Public Viewing Video');
      const video = await uploadVideoViaApi(accessToken, { title, filePath: SAMPLE_VIDEO_PATH });

      await page.goto('/');
      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();

      const card = page.locator('.video-card', { hasText: title });
      await expect(card).toBeVisible();
      await expect(card.locator('.video-card__uploader')).toHaveText(uploader.displayName);

      // Fetching a single video's metadata (what renders the watch page) is a public endpoint -
      // assert the browser actually gets a 200 while logged out. This intentionally doesn't
      // assert on post-playback DOM: a Shaka Player error replaces the whole page, including
      // metadata that already rendered fine, and playback itself is a separate, later test.
      const [videoResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/videos/${video.id}`) && response.request().method() === 'GET',
        ),
        card.click(),
      ]);
      expect(videoResponse.status()).toBe(200);
      await expect(page).toHaveURL(`/watch/${video.id}`);

      const accessTokenInStorage = await page.evaluate(
        (key) => localStorage.getItem(key),
        ACCESS_TOKEN_KEY,
      );
      expect(accessTokenInStorage).toBeNull();
    },
  );
});
