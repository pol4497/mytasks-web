import { getAuthSession } from '../features/auth/storage/authStorage';
import { getGuestSession } from '../features/guest/storage/guestStorage';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(
  /\/$/,
  '',
);

export interface ApiRequestOptions extends RequestInit {
  /** Set to false for endpoints that must never receive an owner header. */
  includeOwnerHeader?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getOwnerHeader(): [string, string] | null {
  const authSession = getAuthSession();

  if (authSession?.accessToken) {
    return ['Authorization', `Bearer ${authSession.accessToken}`];
  }

  const guestSession = getGuestSession();

  if (guestSession?.guestToken) {
    return ['X-Guest-Token', guestSession.guestToken];
  }

  return null;
}

function getApiUrl(path: string) {
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalisedPath}`;
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (typeof body === 'object' && body !== null) {
      const problem = body as {
        detail?: string;
        title?: string;
        errors?: Record<string, string[]>;
      };

      const validationMessage = Object.values(problem.errors ?? {})
        .flat()
        .join(' ');

      return (
        problem.detail ||
        validationMessage ||
        problem.title ||
        'The request failed.'
      );
    }
  } catch {
    // Some API errors do not include a JSON response body.
  }

  return 'The request failed.';
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    includeOwnerHeader = true,
    headers: requestHeaders,
    ...fetchOptions
  } = options;

  const headers = new Headers(requestHeaders);

  headers.set('Accept', 'application/json');

  if (
    includeOwnerHeader &&
    !headers.has('Authorization') &&
    !headers.has('X-Guest-Token')
  ) {
    const ownerHeader = getOwnerHeader();

    if (ownerHeader) headers.set(...ownerHeader);
  }

  const response = await fetch(getApiUrl(path), { ...fetchOptions, headers });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
