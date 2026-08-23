import { apiClient } from '../../lib/apiClient';
import type { AuthResponse } from './types';

export interface SignupInput {
  displayName: string;
  email: string;
  password: string;
}

export function signup(input: SignupInput): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/signup', input);
}

export interface LoginInput {
  email: string;
  password: string;
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/login', input);
}
