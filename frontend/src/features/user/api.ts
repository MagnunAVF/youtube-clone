import type { StoredUser } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function createUser(displayName: string): Promise<StoredUser> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  const data = (await response.json()) as { _id: string; displayName: string };
  return { id: data._id, displayName: data.displayName };
}
