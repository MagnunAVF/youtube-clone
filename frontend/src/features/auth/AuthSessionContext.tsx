import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthUser } from './types';
import {
  clearAccessToken,
  clearStoredUser,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from './session';

interface AuthSessionContextValue {
  accessToken: string | null;
  user: AuthUser | null;
  login: (accessToken: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken());
  const [user, setUserState] = useState<AuthUser | null>(() => getStoredUser());

  const login = (token: string, nextUser: AuthUser) => {
    setAccessToken(token);
    setStoredUser(nextUser);
    setAccessTokenState(token);
    setUserState(nextUser);
  };

  const logout = () => {
    clearAccessToken();
    clearStoredUser();
    setAccessTokenState(null);
    setUserState(null);
  };

  return (
    <AuthSessionContext.Provider value={{ accessToken, user, login, logout }}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider');
  }
  return context;
}
