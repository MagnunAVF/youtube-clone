import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // CI also gets an HTML report so a failure has a trace/screenshot artifact to inspect.
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Full suite runs desktop-only; only tests tagged @journey (the core signup -> upload ->
    // view -> play path) re-run at a mobile viewport, so the suite doesn't double in size.
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      grep: /@journey/,
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
