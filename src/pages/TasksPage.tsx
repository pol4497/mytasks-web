import { useGuestSession } from '../features/guest/hooks/useGuestSession';
import { TaskBrowser } from '../features/tasks/components/TaskBrowser';

export function TasksPage() {
  const { isReady, isLoading, error, retry } = useGuestSession();

  return (
    <main className='page-shell'>
      <header className='page-header'>
        <p className='eyebrow'>MYTASKS</p>
        <p>Insert and inspect your daily tasks.</p>
      </header>

      {isLoading && (
        <p className='session-state' role='status'>
          Preparing your task space…
        </p>
      )}

      {!isLoading && error && (
        <section className='session-error' role='alert'>
          <p>Could not start your guest session: {error}</p>
          <button onClick={() => void retry()} type='button'>
            Try again
          </button>
        </section>
      )}

      {isReady && <TaskBrowser />}
    </main>
  );
}
