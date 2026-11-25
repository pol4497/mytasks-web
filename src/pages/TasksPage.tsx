import { useSession } from '../features/auth/hooks/useSession';
import { TaskBrowser } from '../features/tasks/components/TaskBrowser';

export function TasksPage() {
  const { status, user, error, retry } = useSession();

  return (
    <main className='page-shell'>
      <header className='page-header'>
        <p className='eyebrow'>MYTASKS</p>
        <p>Insert and inspect your daily tasks.</p>
      </header>

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
