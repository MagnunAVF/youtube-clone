export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
}
