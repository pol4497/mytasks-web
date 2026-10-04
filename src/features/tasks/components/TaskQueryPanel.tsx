import { taskStatuses, type TaskQuery } from '../types/task';
import styles from './TaskQueryPanel.module.css';

interface TaskQueryPanelProps {
  onChange: (changes: Partial<TaskQuery>) => void;
  onChangePagination: (changes: Partial<TaskQuery>) => void;
  onClose: () => void;
  onReset: () => void;
  query: TaskQuery;
  hasNextPage: boolean;
}

export function TaskQueryPanel({
  onChange,
  onChangePagination,
  onClose,
  onReset,
  query,
  hasNextPage,
}: TaskQueryPanelProps) {
  const limit = query.limit;
  const offset = query.offset ?? 0;

  const canGoBack = offset > 0;

  const currentPage = limit ? Math.floor(offset / limit) + 1 : 1;

  return (
    <section
      className={styles.panel}
      id='task-query-panel'
      aria-label='Filter, sort, and pagination options'
    >
      <div className={styles.heading}>
        <h2>Filter & sort</h2>

        <button className={styles.closeButton} onClick={onClose} type='button'>
          Close
        </button>
      </div>

      <div className={styles.controls}>
        <label>
          Status
          <select
            onChange={(event) => {
              const value = event.target.value;

              onChange({
                status: value ? (value as TaskQuery['status']) : undefined,
              });
            }}
            value={query.status ?? ''}
          >
            <option value=''>All statuses</option>

            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status === 'InProgress' ? 'In progress' : status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <input
            onChange={(event) =>
              onChange({
                category: event.target.value || undefined,
              })
            }
            placeholder='Any category'
            value={query.category ?? ''}
          />
        </label>

        <label>
          Due after
          <input
            onChange={(event) =>
              onChange({
                dueAfter: event.target.value || undefined,
              })
            }
            type='date'
            value={query.dueAfter ?? ''}
          />
        </label>

        <label>
          Due before
          <input
            onChange={(event) =>
              onChange({
                dueBefore: event.target.value || undefined,
              })
            }
            type='date'
            value={query.dueBefore ?? ''}
          />
        </label>

        <label>
          Sort by
          <select
            onChange={(event) =>
              onChange({
                sortBy: event.target.value as TaskQuery['sortBy'],
              })
            }
            value={query.sortBy ?? 'DueDate'}
          >
            <option value='DueDate'>Due date</option>
            <option value='Title'>Title</option>
            <option value='Status'>Status</option>
          </select>
        </label>

        <label>
          Direction
          <select
            onChange={(event) =>
              onChange({
                desc: event.target.value === 'desc',
              })
            }
            value={query.desc ? 'desc' : 'asc'}
          >
            <option value='asc'>Ascending</option>
            <option value='desc'>Descending</option>
          </select>
        </label>
      </div>

      <div className={styles.footer}>
        <button className={styles.resetButton} onClick={onReset} type='button'>
          Reset
        </button>

        <div className={styles.pager}>
          <label>
            Per page
            <select
              onChange={(event) => {
                const value = event.target.value;

                onChangePagination({
                  limit: value ? Number(value) : undefined,
                  offset: 0,
                });
              }}
              value={query.limit ?? ''}
            >
              <option value=''>All</option>
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='25'>25</option>
              <option value='50'>50</option>
            </select>
          </label>

          <button
            disabled={!canGoBack}
            onClick={() =>
              onChangePagination({
                offset: Math.max(0, offset - (limit ?? 0)),
              })
            }
            type='button'
          >
            Previous
          </button>

          <span>Page {currentPage}</span>

          <button
            disabled={!limit || !hasNextPage}
            onClick={() =>
              onChangePagination({
                offset: offset + (limit ?? 0),
              })
            }
            type='button'
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
