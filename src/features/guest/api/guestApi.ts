import { apiRequest } from '../../../lib/apiClient';
import type { GuestSession } from '../types/guest';

export const guestApi = {
  createSession: () =>
    apiRequest<GuestSession>('/guest/session', {
      method: 'POST',
      includeOwnerHeader: false,
    }),
};
