import { getAuthSession } from '../features/auth/storage/authStorage';
import { getGuestSession } from '../features/guest/storage/guestStorage';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(
  /\/$/,
  '',
);

export interface ApiRequestOptions extends RequestInit {
  /** Set to false for endpoints that must never receive an owner header. */
  includeOwnerHeader?: boolean;

  /** Set to false for endpoints such as token refresh, which must not retry on 401. */
  retryOnUnauthorized?: boolean;
}

type UnauthorizedRetryHandler = () => Promise<boolean>;

let unauthorizedRetryHandler: UnauthorizedRetryHandler | null = null;
let tokenRefreshPromise: Promise<boolean> | null = null;

export function setUnauthorizedRetryHandler(handler: UnauthorizedRetryHandler) {
  unauthorizedRetryHandler = handler;

  return () => {
    if (unauthorizedRetryHandler === handler) {
      unauthorizedRetryHandler = null;
    }
  };
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

async function refreshAccessToken() {
  if (!unauthorizedRetryHandler) return false;

  if (!tokenRefreshPromise) {
    tokenRefreshPromise = unauthorizedRetryHandler().finally(() => {
      tokenRefreshPromise = null;
    });
  }

  return tokenRefreshPromise;
}

async function sendRequest(path: string, options: ApiRequestOptions) {
  const {
    includeOwnerHeader = true,
    retryOnUnauthorized: ignoredRetryOnUnauthorized,
    headers: requestHeaders,
    ...fetchOptions
  } = options;

  void ignoredRetryOnUnauthorized;

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

  return fetch(getApiUrl(path), {
    ...fetchOptions,
    headers,
  });
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await sendRequest(path, options);

  if (
    response.status === 401 &&
    options.retryOnUnauthorized !== false &&
    (await refreshAccessToken())
  ) {
    return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
  }

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
