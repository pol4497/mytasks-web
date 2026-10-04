import { TaskBrowser } from '../features/tasks/components/TaskBrowser';

export function TasksPage() {
  return (
    <main className='page-shell'>
      <header className='page-header'>
        <p className='eyebrow'>MYTASKS</p>
        <p>Insert and inspect your daily tasks.</p>
      </header>

      <TaskBrowser />
    </main>
  );
}
