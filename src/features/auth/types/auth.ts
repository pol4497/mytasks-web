/** The safe user information returned by the API. */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

/** Body for POST /api/auth/register. */
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

/** Body for POST /api/auth/login. */
export interface LoginInput {
  username: string;
  password: string;
}

/** Body for POST /api/auth/refresh and POST /api/auth/logout. */
export interface RefreshTokenInput {
  refreshToken: string;
}

/** Response from login and refresh requests. */
export interface AuthSession {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
}
