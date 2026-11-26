import { apiRequest } from '../../../lib/apiClient';
import type {
  AuthSession,
  AuthUser,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from '../types/auth';

export const authApi = {
  register: (input: RegisterInput) =>
    apiRequest<AuthUser>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),

  login: (input: LoginInput) =>
    apiRequest<AuthSession>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),

  refresh: (input: RefreshTokenInput) =>
    apiRequest<AuthSession>('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      includeOwnerHeader: false,
      retryOnUnauthorized: false,
    }),

  logout: (input: RefreshTokenInput) =>
    apiRequest<void>('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),

  getCurrentUser: () => apiRequest<AuthUser>('/auth/me'),
};
