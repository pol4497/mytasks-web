export const taskStatuses = ['Pending', 'InProgress', 'Completed', 'Cancelled'] as const

export type TaskStatus = (typeof taskStatuses)[number]
export type TaskSortField = 'DueDate' | 'Title' | 'Status'

/** The task shape returned by GET /api/tasks. */
export interface Task {
  id: number
  title: string
  description: string
  dueDate: string | null
  category: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

/** Fields accepted when creating a task. */
export interface CreateTaskInput {
  title: string
  description: string
  dueDate: string | null
  category: string
}

/** Fields accepted when replacing an existing task. */
export interface UpdateTaskInput extends CreateTaskInput {
  status: TaskStatus
}

/** Optional query parameters supported by GET /api/tasks. */
export interface TaskQuery {
  status?: TaskStatus
  category?: string
  dueBefore?: string
  dueAfter?: string
  search?: string
  sortBy?: TaskSortField
  desc?: boolean
  limit?: number
  offset?: number
}
