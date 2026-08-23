import { createContext, useContext, useState, type ReactNode } from 'react';
import { clearAccessToken, getAccessToken, setAccessToken } from './session';

interface AuthSessionContextValue {
  accessToken: string | null;
  login: (accessToken: string) => void;
  logout: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken());

  const login = (token: string) => {
    setAccessToken(token);
    setAccessTokenState(token);
  };

  const logout = () => {
    clearAccessToken();
    setAccessTokenState(null);
  };

  return (
    <AuthSessionContext.Provider value={{ accessToken, login, logout }}>
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
