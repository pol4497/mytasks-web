import { createContext } from 'react';
import type { GuestSession } from '../../guest/types/guest';
import type { AuthUser, LoginInput, RegisterInput } from '../types/auth';

export type SessionStatus = 'loading' | 'guest' | 'authenticated' | 'error';

export interface SessionContextValue {
  status: SessionStatus;
  user: AuthUser | null;
  guestSession: GuestSession | null;
  error: string;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
