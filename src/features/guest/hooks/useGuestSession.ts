import { useCallback, useEffect, useState } from 'react';
import { getAuthSession } from '../../auth/storage/authStorage';
import { guestApi } from '../api/guestApi';
import {
  clearGuestSession,
  getGuestSession,
  saveGuestSession,
} from '../storage/guestStorage';

function hasExpired(expiresAt: string) {
  const expirationTime = Date.parse(expiresAt);
  return Number.isNaN(expirationTime) || expirationTime <= Date.now();
}

export function useGuestSession() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const ensureGuestSession = useCallback(async () => {
    setIsLoading(true);
    setIsReady(false);
    setError('');

    // A signed-in user already has an owner identity for task requests.
    if (getAuthSession()) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    const savedGuestSession = getGuestSession();

    if (savedGuestSession && !hasExpired(savedGuestSession.expiresAt)) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    if (savedGuestSession) clearGuestSession();

    try {
      const guestSession = await guestApi.createSession();
      saveGuestSession(guestSession);
      setIsReady(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not start a guest session.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void ensureGuestSession();
  }, [ensureGuestSession]);

  return { isReady, isLoading, error, retry: ensureGuestSession };
}
