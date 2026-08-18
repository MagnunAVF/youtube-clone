import type { StoredUser } from './types';
import { apiClient } from '../../lib/apiClient';

interface UserResponse {
  _id: string;
  displayName: string;
}

export async function createUser(displayName: string): Promise<StoredUser> {
  const data = await apiClient.post<UserResponse>('/users', { displayName });
  return { id: data._id, displayName: data.displayName };
}
