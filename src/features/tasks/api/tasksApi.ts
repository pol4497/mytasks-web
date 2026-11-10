import { apiRequest } from '../../../lib/apiClient';
import type {
  CreateTaskInput,
  Task,
  TaskQuery,
  UpdateTaskInput,
} from '../types/task';

function toQueryString(query: TaskQuery): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }

  const value = params.toString();
  return value ? `?${value}` : '';
}

export const tasksApi = {
  getAll: (query: TaskQuery = {}) =>
    apiRequest<Task[]>(`/tasks${toQueryString(query)}`),

  create: (task: CreateTaskInput) =>
    apiRequest<Task>('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    }),

  update: (id: number, task: UpdateTaskInput) =>
    apiRequest<void>(`/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' }),
};
