/** Response from POST /api/guest/session. */
export interface GuestSession {
  guestToken: string;
  expiresAt: string;
}
