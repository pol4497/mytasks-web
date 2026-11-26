import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { setUnauthorizedRetryHandler } from '../../../lib/apiClient';
import { authApi } from '../api/authApi';
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../storage/authStorage';
import type { AuthUser, LoginInput, RegisterInput } from '../types/auth';
import { guestApi } from '../../guest/api/guestApi';
import {
  clearGuestSession,
  getGuestSession,
  saveGuestSession,
} from '../../guest/storage/guestStorage';
import type { GuestSession } from '../../guest/types/guest';
import {
  SessionContext,
  type SessionContextValue,
  type SessionStatus,
} from './sessionContext';

function hasExpired(expiresAt: string) {
  const expirationTime = Date.parse(expiresAt);
  return Number.isNaN(expirationTime) || expirationTime <= Date.now();
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [error, setError] = useState('');
  const initialisationPromise = useRef<Promise<void> | null>(null);

  const startGuestSession = useCallback(async () => {
    const savedGuestSession = getGuestSession();

    if (savedGuestSession && !hasExpired(savedGuestSession.expiresAt)) {
      setGuestSession(savedGuestSession);
      setUser(null);
      setStatus('guest');
      return;
    }

    if (savedGuestSession) clearGuestSession();

    const newGuestSession = await guestApi.createSession();
    saveGuestSession(newGuestSession);
    setGuestSession(newGuestSession);
    setUser(null);
    setStatus('guest');
  }, []);

  const initialise = useCallback(() => {
    if (initialisationPromise.current) return initialisationPromise.current;

    const initialisation = (async () => {
      setStatus('loading');
      setError('');

      const savedAuthSession = getAuthSession();

      if (savedAuthSession) {
        try {
          const refreshedSession = await authApi.refresh({
            refreshToken: savedAuthSession.refreshToken,
          });

          saveAuthSession(refreshedSession);
          clearGuestSession();
          setGuestSession(null);
          setUser(refreshedSession.user);
          setStatus('authenticated');
          return;
        } catch {
          // A failed refresh returns the browser to guest mode.
          clearAuthSession();
        }
      }

      try {
        await startGuestSession();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not start a guest session.',
        );
        setStatus('error');
      }
    })();

    initialisationPromise.current = initialisation;

    void initialisation.finally(() => {
      initialisationPromise.current = null;
    });

    return initialisation;
  }, [startGuestSession]);

  useEffect(() => {
    void initialise();
  }, [initialise]);

  useEffect(() => {
    return setUnauthorizedRetryHandler(async () => {
      const savedAuthSession = getAuthSession();

      if (!savedAuthSession) return false;

      try {
        const refreshedSession = await authApi.refresh({
          refreshToken: savedAuthSession.refreshToken,
        });

        saveAuthSession(refreshedSession);
        clearGuestSession();
        setGuestSession(null);
        setUser(refreshedSession.user);
        setStatus('authenticated');

        return true;
      } catch {
        clearAuthSession();
        setUser(null);
        setGuestSession(null);

        try {
          await startGuestSession();
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Could not start a guest session.',
          );
          setStatus('error');
        }

        return false;
      }
    });
  }, [startGuestSession]);

  const login = useCallback(async (input: LoginInput) => {
    setError('');

    try {
      const session = await authApi.login(input);
      saveAuthSession(session);
      clearGuestSession();
      setGuestSession(null);
      setUser(session.user);
      setStatus('authenticated');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not sign in.',
      );
      throw caughtError;
    }
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      setError('');

      try {
        await authApi.register(input);
        clearGuestSession();
        setGuestSession(null);
        await login({ username: input.username, password: input.password });
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not create the account.',
        );
        throw caughtError;
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    const savedAuthSession = getAuthSession();

    try {
      if (savedAuthSession) {
        await authApi.logout({ refreshToken: savedAuthSession.refreshToken });
      }
    } finally {
      clearAuthSession();
      setUser(null);
      setGuestSession(null);
      setError('');

      try {
        await startGuestSession();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not start a guest session.',
        );
        setStatus('error');
      }
    }
  }, [startGuestSession]);

  const value: SessionContextValue = {
    status,
    user,
    guestSession,
    error,
    isAuthenticated: status === 'authenticated',
    login,
    register,
    logout,
    retry: initialise,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
