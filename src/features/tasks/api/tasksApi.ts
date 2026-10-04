import type {
  CreateTaskInput,
  Task,
  TaskQuery,
  UpdateTaskInput,
} from '../types/task';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/tasks';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path = '', options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null) {
      const problem = body as {
        detail?: string;
        title?: string;
        errors?: Record<string, string[]>;
      };
      const validationMessage = Object.values(problem.errors ?? {})
        .flat()
        .join(' ');
      return (
        (problem.detail ?? problem.title ?? validationMessage) ||
        'The request failed.'
      );
    }
  } catch {
    // Some server errors do not contain a JSON body.
  }
  return 'The request failed.';
}

function toQueryString(query: TaskQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const value = params.toString();
  return value ? `?${value}` : '';
}

export const tasksApi = {
  getAll: (query: TaskQuery = {}) => request<Task[]>(toQueryString(query)),

  create: (task: CreateTaskInput) =>
    request<Task>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    }),

  update: (id: number, task: UpdateTaskInput) =>
    request<void>(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    }),

  remove: (id: number) => request<void>(`/${id}`, { method: 'DELETE' }),
};
