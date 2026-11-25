import { useState } from 'react';
import { AuthPanel } from '../features/auth/components/AuthPanel';
import { useSession } from '../features/auth/hooks/useSession';
import { TaskBrowser } from '../features/tasks/components/TaskBrowser';

export function TasksPage() {
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);
  const { status, user, error, retry, logout } = useSession();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Local tokens are still cleared by SessionProvider's finally block.
    }
  }

  return (
    <main className='page-shell'>
      <header className='page-header'>
        <div className='page-header-row'>
          <div>
            <p className='eyebrow'>MYTASKS</p>
            <p>Insert and inspect your daily tasks.</p>
          </div>

          {status === 'guest' && (
            <button
              className='account-button'
              onClick={() => setIsAuthPanelOpen((isOpen) => !isOpen)}
              type='button'
            >
              Sign in
            </button>
          )}

          {status === 'authenticated' && user && (
            <div className='account-actions'>
              <span>{user.username}</span>
              <button
                className='account-button'
                onClick={() => void handleLogout()}
                type='button'
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {status === 'guest' && isAuthPanelOpen && (
        <AuthPanel
          onClose={() => setIsAuthPanelOpen(false)}
          onComplete={() => setIsAuthPanelOpen(false)}
        />
      )}

      {status === 'loading' && (
        <p className='session-state' role='status'>
          Preparing your task space…
        </p>
      )}

      {status === 'error' && (
        <section className='session-error' role='alert'>
          <p>Could not prepare your task space: {error}</p>
          <button onClick={() => void retry()} type='button'>
            Try again
          </button>
        </section>
      )}

      {(status === 'guest' || status === 'authenticated') && (
        <TaskBrowser key={user?.id ?? 'guest'} />
      )}
    </main>
  );
}
