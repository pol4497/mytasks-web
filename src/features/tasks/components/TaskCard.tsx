import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  taskStatuses,
  type Task,
  type TaskStatus,
  type UpdateTaskInput,
} from '../types/task';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  isUpdating: boolean;
  onUpdate: (id: number, input: UpdateTaskInput) => Promise<void>;
  isDeleting: boolean;
  onDelete: (id: number) => Promise<void>;
}

type EditingField = 'title' | 'category' | 'dueDate' | 'status' | null;

const statusLabels = {
  Pending: 'Pending',
  InProgress: 'In progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
} as const;

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return 'No due date';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(dueDate),
  );
}

function toDateInputValue(dueDate: string | null) {
  if (!dueDate) return '';

  return dueDate.slice(0, 10);
}

export function TaskCard({
  task,
  isUpdating,
  onUpdate,
  isDeleting,
  onDelete,
}: TaskCardProps) {
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [draftValue, setDraftValue] = useState('');

  const isBusy = isUpdating || isDeleting;

  const startEditing = (field: Exclude<EditingField, null>, value: string) => {
    if (isBusy) return;

    setEditingField(field);
    setDraftValue(value);
  };

  const cancelEditing = () => {
    if (isBusy) return;

    setEditingField(null);
    setDraftValue('');
  };

  const saveField = async () => {
    if (!editingField || isBusy) return;

    const value = editingField === 'dueDate' ? draftValue : draftValue.trim();

    //Title is required.
    if (editingField === 'title' && !value) return;

    const input: UpdateTaskInput = {
      title: editingField === 'title' ? value : task.title,
      description: task.description,
      dueDate: editingField === 'dueDate' ? value || null : task.dueDate,
      category: editingField === 'category' ? value : task.category,
      status: editingField === 'status' ? (value as TaskStatus) : task.status,
    };

    try {
      await onUpdate(task.id, input);

      setEditingField(null);
      setDraftValue('');
    } catch {
      // Keep the editor open so the user can retry
    }
  };

  const handleDelete = async () => {
    if (isBusy) return;

    const confirmed = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await onDelete(task.id);
    } catch {
      // Keep the card visible if deletion fails.
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void saveField();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  return (
    <article className={styles.card}>
      <button
        aria-label={`Delete ${task.title}`}
        className={styles.deleteButton}
        disabled={isBusy}
        onClick={() => void handleDelete()}
        title='Delete task'
        type='button'
      >
        {'x'}
      </button>
      {editingField === 'status' ? (
        <select
          autoFocus
          disabled={isBusy}
          onChange={(event) => {
            setDraftValue(event.target.value);
          }}
          onBlur={() => void saveField()}
          value={draftValue}
        >
          {' '}
          {taskStatuses.map((status) => (
            <option key={status} value={status}>
              {' '}
              {statusLabels[status]}{' '}
            </option>
          ))}{' '}
        </select>
      ) : (
        <span
          className={`${styles.status} ${styles[task.status]}`}
          onDoubleClick={() => startEditing('status', task.status)}
          title='Double-click to edit'
        >
          {' '}
          {statusLabels[task.status]}{' '}
        </span>
      )}

      {editingField === 'title' ? (
        <input
          autoFocus
          disabled={isUpdating}
          onBlur={() => void saveField()}
          onChange={(event) => setDraftValue(event.target.value)}
          onKeyDown={handleKeyDown}
          value={draftValue}
        />
      ) : (
        <h3
          onDoubleClick={() => startEditing('title', task.title)}
          title='Double-click to edit'
        >
          {' '}
          {task.title}{' '}
        </h3>
      )}

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <dl className={styles.details}>
        {' '}
        <div>
          {' '}
          <dt>Category</dt>{' '}
          {editingField === 'category' ? (
            <dd>
              {' '}
              <input
                autoFocus
                disabled={isUpdating}
                onBlur={() => void saveField()}
                onChange={(event) => setDraftValue(event.target.value)}
                onKeyDown={handleKeyDown}
                value={draftValue}
              />{' '}
            </dd>
          ) : (
            <dd
              onDoubleClick={() =>
                startEditing('category', task.category ?? '')
              }
              title='Double-click to edit'
            >
              {' '}
              {task.category || 'Uncategorised'}{' '}
            </dd>
          )}{' '}
        </div>{' '}
        <div>
          {' '}
          <dt>Due</dt>{' '}
          {editingField === 'dueDate' ? (
            <dd>
              {' '}
              <input
                autoFocus
                disabled={isUpdating}
                onBlur={() => void saveField()}
                onChange={(event) => setDraftValue(event.target.value)}
                onKeyDown={handleKeyDown}
                type='date'
                value={draftValue}
              />{' '}
            </dd>
          ) : (
            <dd
              onDoubleClick={() =>
                startEditing('dueDate', toDateInputValue(task.dueDate))
              }
              title='Double-click to edit'
            >
              {' '}
              {formatDueDate(task.dueDate)}{' '}
            </dd>
          )}{' '}
        </div>{' '}
      </dl>
    </article>
  );
}
