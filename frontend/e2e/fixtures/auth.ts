import { test as base, expect } from '@playwright/test';
import { testUser, type TestUser } from './test-data';

const API_BASE_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';

// Matches the keys AuthSessionContext reads from — see frontend/src/features/auth/session.ts.
const ACCESS_TOKEN_KEY = 'youtube-clone:accessToken';
const USER_KEY = 'youtube-clone:authUser';

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

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error(`Failed to sign up test user: ${response.status}`);
    }
    const body = (await response.json()) as { accessToken: string; user: { id: string } };

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
