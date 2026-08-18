import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { StoredUser } from './types';
import { createUser as createUserRequest } from './api';
import { addStoredUser, getCurrentUserId, getStoredUsers, setCurrentUserId } from './storage';

interface CurrentUserContextValue {
  currentUser: StoredUser | null;
  users: StoredUser[];
  selectUser: (id: string) => void;
  createUser: (displayName: string) => Promise<void>;
  switchUser: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(() => getStoredUsers());
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(() => getCurrentUserId());

  const selectUser = (id: string) => {
    setCurrentUserId(id);
    setCurrentUserIdState(id);
  };

  const createUser = async (displayName: string) => {
    const user = await createUserRequest(displayName);
    addStoredUser(user);
    setUsers((previous) => [...previous, user]);
    selectUser(user.id);
  };

  const switchUser = () => {
    setCurrentUserId(null);
    setCurrentUserIdState(null);
  };

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  return (
    <CurrentUserContext.Provider value={{ currentUser, users, selectUser, createUser, switchUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return context;
}
