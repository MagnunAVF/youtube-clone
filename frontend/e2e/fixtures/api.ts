import type { TestUser } from './test-data';

export const API_BASE_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';

export interface SignupResponse {
  accessToken: string;
  user: { id: string; displayName: string; email: string };
}

// Bypasses the UI entirely — for tests that just need an account to already exist
// (e.g. a duplicate-email check) without driving the signup form or touching the page's session.
export async function signUpViaApi(user: TestUser): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error(`Failed to sign up test user: ${response.status}`);
  }
  return (await response.json()) as SignupResponse;
}
