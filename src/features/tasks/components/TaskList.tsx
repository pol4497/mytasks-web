import type { Task, UpdateTaskInput } from '../types/task';
import { TaskCard } from './TaskCard';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string;
  updatingTaskId: number | null;
  onUpdate: (id: number, input: UpdateTaskInput) => Promise<void>;
  deletingTaskId: number | null;
  onDelete: (id: number) => Promise<void>;
}

export function TaskList({
  tasks,
  isLoading,
  error,
  updatingTaskId,
  onUpdate,
  deletingTaskId,
  onDelete,
}: TaskListProps) {
  return (
    <section className={styles.section} aria-labelledby='tasks-heading'>
      <div className={styles.heading}>
        <h2 id='tasks-heading'>Your tasks</h2>
        <span>{tasks.length} total</span>
      </div>
      {isLoading && <p className={styles.state}>Loading tasks…</p>}
      {!isLoading && error && (
        <p className={styles.error} role='alert'>
          Could not load tasks: {error}
        </p>
      )}
      {!isLoading && !error && tasks.length === 0 && (
        <p className={styles.state}>
          No tasks yet. Add one above to get started.
        </p>
      )}
      {!isLoading && !error && tasks.length > 0 && (
        <div className={styles.list}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isUpdating={updatingTaskId === task.id}
              onUpdate={onUpdate}
              isDeleting={deletingTaskId === task.id}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
