import { test as base, expect } from '@playwright/test';
import { testUser, type TestUser } from './test-data';
import { signUpViaApi } from './api';

// Matches the keys AuthSessionContext reads from — see frontend/src/features/auth/session.ts.
export const ACCESS_TOKEN_KEY = 'youtube-clone:accessToken';
export const USER_KEY = 'youtube-clone:authUser';

export interface SignedInUser extends TestUser {
  id: string;
  accessToken: string;
}

interface AuthFixtures {
  signedInUser: SignedInUser;
}

export const test = base.extend<AuthFixtures>({
  // Signs up a fresh user via the API (fast, no UI interaction) and seeds the browser's
  // localStorage before any navigation, so tests that just need "a logged-in user" as a
  // precondition don't have to re-drive the signup form every time.
  signedInUser: async ({ page }, use) => {
    const user = testUser('E2E User');
    const body = await signUpViaApi(user);

    await page.addInitScript(
      ({ tokenKey, userKey, token, storedUser }) => {
        localStorage.setItem(tokenKey, token);
        localStorage.setItem(userKey, JSON.stringify(storedUser));
      },
      {
        tokenKey: ACCESS_TOKEN_KEY,
        userKey: USER_KEY,
        token: body.accessToken,
        storedUser: { id: body.user.id, displayName: user.displayName, email: user.email },
      },
    );

    await use({ ...user, id: body.user.id, accessToken: body.accessToken });
  },
});

export { expect };
