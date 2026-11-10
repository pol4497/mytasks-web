import type { AuthSession } from '../types/auth';

const authSessionStorageKey = 'mytasks.auth-session';

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false;

  const session = value as Partial<AuthSession>;
  const user = session.user;

  return (
    typeof session.accessToken === 'string' &&
    typeof session.accessTokenExpiresAt === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof session.refreshTokenExpiresAt === 'string' &&
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'number' &&
    typeof user.username === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string' &&
    typeof user.createdAt === 'string'
  );
}

export function getAuthSession(): AuthSession | null {
  const savedSession = sessionStorage.getItem(authSessionStorageKey);
  if (!savedSession) return null;

  try {
    const parsedSession: unknown = JSON.parse(savedSession);

    if (isAuthSession(parsedSession)) return parsedSession;
  } catch {
    // Invalid browser storage is treated as an absent session.
  }

  clearAuthSession();
  return null;
}

export function saveAuthSession(session: AuthSession) {
  sessionStorage.setItem(authSessionStorageKey, JSON.stringify(session));
}

export function clearAuthSession() {
  sessionStorage.removeItem(authSessionStorageKey);
}
