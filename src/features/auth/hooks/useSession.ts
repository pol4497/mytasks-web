import { useContext } from 'react';
import { SessionContext } from '../context/sessionContext';

export function useSession() {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('useSession must be used within a SessionProvider.');
  }

  return session;
}
