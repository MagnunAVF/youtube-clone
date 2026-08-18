import type { StoredUser } from './types';

const USERS_KEY = 'youtube-clone:users';
const CURRENT_USER_ID_KEY = 'youtube-clone:currentUserId';

export function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

export function addStoredUser(user: StoredUser): void {
  const users = getStoredUsers();
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_ID_KEY);
}

export function setCurrentUserId(id: string | null): void {
  if (id) {
    localStorage.setItem(CURRENT_USER_ID_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  }
}
