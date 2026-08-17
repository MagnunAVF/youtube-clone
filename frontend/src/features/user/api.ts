import type { StoredUser } from './types';
import { API_BASE_URL } from '../../lib/config';

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
