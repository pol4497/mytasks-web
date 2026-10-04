import { useCallback, useEffect, useState } from 'react';
import { tasksApi } from '../api/tasksApi';
import type {
  CreateTaskInput,
  Task,
  TaskQuery,
  UpdateTaskInput,
} from '../types/task';

export function useTasks(query: TaskQuery = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const limit = query.limit;

      /*
       * When pagination is not enabled, request exactly what
       * the user asked for: all matching tasks.
       */
      if (!limit) {
        const result = await tasksApi.getAll(query);

        setTasks(result);
        setHasNextPage(false);

        return;
      }

      /*
       * When pagination is enabled, request one extra task.
       *
       * Example:
       * limit = 10
       * request 11
       *
       * 11 results means another page exists.
       * We display only the first 10.
       */
      const result = await tasksApi.getAll({
        ...query,
        limit: limit + 1,
      });

      setHasNextPage(result.length > limit);
      setTasks(result.slice(0, limit));
    } catch (caughtError) {
      setLoadError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not load tasks.',
      );
      setTasks([]);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      setIsCreating(true);
      setCreateError('');

      try {
        const createdTask = await tasksApi.create(input);

        await loadTasks();

        return createdTask;
      } catch (caughtError) {
        setCreateError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not add the task.',
        );

        throw caughtError;
      } finally {
        setIsCreating(false);
      }
    },
    [loadTasks],
  );

  const updateTask = useCallback(
    async (id: number, input: UpdateTaskInput) => {
      setUpdatingTaskId(id);
      setUpdateError('');

      try {
        await tasksApi.update(id, input);
        await loadTasks();
      } catch (caughtError) {
        setUpdateError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not update the task.',
        );
        throw caughtError;
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [loadTasks],
  );

  const deleteTask = useCallback(
    async (id: number) => {
      setDeletingTaskId(id);
      setDeleteError('');
      try {
        await tasksApi.remove(id);
        /* * Re-fetch the current query so the deleted task * disappears and pagination stays in sync. */ await loadTasks();
      } catch (caughtError) {
        setDeleteError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not delete the task.',
        );
        throw caughtError;
      } finally {
        setDeletingTaskId(null);
      }
    },
    [loadTasks],
  );

  return {
    tasks,
    hasNextPage,
    isLoading,
    loadError,
    isCreating,
    createError,
    updatingTaskId,
    updateError,
    deletingTaskId,
    deleteError,
    createTask,
    updateTask,
    deleteTask,
  };
}
