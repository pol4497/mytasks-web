import { useState } from 'react';
import { AddTaskForm } from './AddTaskForm';
import { TaskList } from './TaskList';
import { TaskQueryPanel } from './TaskQueryPanel';
import { TaskToolbar } from './TaskToolbar';
import { useTasks } from '../hooks/useTasks';
import type { TaskQuery } from '../types/task';

const DEFAULT_QUERY: TaskQuery = {
  limit: 10,
  offset: 0,
};

export function TaskBrowser() {
  const [query, setQuery] = useState<TaskQuery>(DEFAULT_QUERY);
  const [isQueryPanelOpen, setIsQueryPanelOpen] = useState(false);

  const {
    tasks,
    hasNextPage,
    isLoading,
    loadError,
    isCreating,
    createError,
    createTask,
    updatingTaskId,
    updateTask,
    deletingTaskId,
    deleteTask,
  } = useTasks(query);

  const updateSearch = (search: string) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      search: search || undefined,
      offset: 0,
    }));
  };

  const updateFilter = (changes: Partial<TaskQuery>) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      ...changes,
      offset: 0,
    }));
  };

  const updatePagination = (changes: Partial<TaskQuery>) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      ...changes,
    }));
  };

  const resetQuery = () => {
    setQuery(DEFAULT_QUERY);
  };

  return (
    <>
      <AddTaskForm
        apiError={createError}
        isSubmitting={isCreating}
        onCreate={createTask}
      />

      <TaskToolbar
        isQueryPanelOpen={isQueryPanelOpen}
        onOpenQueryPanel={() => setIsQueryPanelOpen((isOpen) => !isOpen)}
        onSearchChange={updateSearch}
        search={query.search ?? ''}
      />

      {isQueryPanelOpen && (
        <TaskQueryPanel
          hasNextPage={hasNextPage}
          onChange={updateFilter}
          onChangePagination={updatePagination}
          onClose={() => setIsQueryPanelOpen(false)}
          onReset={resetQuery}
          query={query}
        />
      )}

      <TaskList
        error={loadError}
        isLoading={isLoading}
        tasks={tasks}
        updatingTaskId={updatingTaskId}
        onUpdate={updateTask}
        deletingTaskId={deletingTaskId}
        onDelete={deleteTask}
      />
    </>
  );
}
