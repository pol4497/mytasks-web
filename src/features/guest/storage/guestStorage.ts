import type { GuestSession } from '../types/guest';

const guestSessionStorageKey = 'mytasks.guest-session';

function isGuestSession(value: unknown): value is GuestSession {
  if (typeof value !== 'object' || value === null) return false;

  const session = value as Partial<GuestSession>;

  return (
    typeof session.guestToken === 'string' &&
    typeof session.expiresAt === 'string'
  );
}

export function getGuestSession(): GuestSession | null {
  const savedSession = localStorage.getItem(guestSessionStorageKey);
  if (!savedSession) return null;

  try {
    const parsedSession: unknown = JSON.parse(savedSession);

    if (isGuestSession(parsedSession)) return parsedSession;
  } catch {
    // Invalid browser storage is treated as an absent guest session.
  }

  clearGuestSession();
  return null;
}

export function saveGuestSession(session: GuestSession) {
  localStorage.setItem(guestSessionStorageKey, JSON.stringify(session));
}

export function clearGuestSession() {
  localStorage.removeItem(guestSessionStorageKey);
}
