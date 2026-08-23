export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
