import { test, expect } from '@playwright/test';
import { signUpViaApi, uploadVideoViaApi } from './fixtures/api';
import { testUser, uniqueTitle } from './fixtures/test-data';
import { SAMPLE_VIDEO_PATH } from './fixtures/video';

const HAVE_ENOUGH_DATA = 4;

test.describe('Watch page playback', () => {
  test('Shaka Player loads and decodes the real uploaded media', async ({ page }) => {
    const uploader = testUser('Playback Uploader');
    const { accessToken } = await signUpViaApi(uploader);
    const title = uniqueTitle('Playback Video');
    const video = await uploadVideoViaApi(accessToken, { title, filePath: SAMPLE_VIDEO_PATH });

    await page.goto(`/watch/${video.id}`);

    // readyState reaching HAVE_ENOUGH_DATA proves the browser actually fetched and decoded
    // the real media from its presigned URL - not just that the page and <video> tag rendered.
    await expect
      .poll(() => page.evaluate(() => document.querySelector('video')?.readyState), {
        timeout: 10_000,
      })
      .toBe(HAVE_ENOUGH_DATA);

    const duration = await page.evaluate(() => document.querySelector('video')?.duration);
    expect(duration).toBeGreaterThan(0);

    await expect(page.getByText('Could not play this video.')).not.toBeVisible();
  });
});
