import { readFile } from 'node:fs/promises';
import type { TestUser } from './test-data';

export const API_BASE_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';

export interface SignupResponse {
  accessToken: string;
  user: { id: string; displayName: string; email: string };
}

// Bypasses the UI entirely - for tests that just need an account to already exist
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

export interface UploadVideoInput {
  title: string;
  description?: string;
  filePath: string;
}

export interface UploadedVideo {
  id: string;
  title: string;
}

// Bypasses the UI entirely - for tests that just need a real, persisted video (with its
// file actually landing in S3) without driving the upload form.
export async function uploadVideoViaApi(
  accessToken: string,
  input: UploadVideoInput,
): Promise<UploadedVideo> {
  const fileBuffer = await readFile(input.filePath);
  const formData = new FormData();
  formData.append('title', input.title);
  if (input.description) {
    formData.append('description', input.description);
  }
  formData.append('file', new Blob([fileBuffer], { type: 'video/mp4' }), 'sample-clip.mp4');

  const response = await fetch(`${API_BASE_URL}/videos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Failed to upload test video: ${response.status}`);
  }
  const body = (await response.json()) as { _id: string; title: string };
  return { id: body._id, title: body.title };
}
