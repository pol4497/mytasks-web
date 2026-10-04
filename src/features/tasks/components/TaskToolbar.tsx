import { useEffect, useState } from 'react';
import styles from './TaskToolbar.module.css';

interface TaskToolbarProps {
  isQueryPanelOpen: boolean;
  onOpenQueryPanel: () => void;
  onSearchChange: (search: string) => void;
  search: string;
}

export function TaskToolbar({
  isQueryPanelOpen,
  onOpenQueryPanel,
  onSearchChange,
  search,
}: TaskToolbarProps) {
  const [searchTerm, setSearchTerm] = useState(search);

  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  useEffect(() => {
    if (searchTerm === search) return;

    const timerId = window.setTimeout(() => onSearchChange(searchTerm.trim()), 300);
    return () => window.clearTimeout(timerId);
  }, [onSearchChange, search, searchTerm]);

  return (
    <section className={styles.toolbar} aria-label='Task search and controls'>
      <label className={styles.search}>
        <span className={styles.visuallyHidden}>Search tasks</span>
        <input
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder='Search tasks'
          type='search'
          value={searchTerm}
        />
      </label>
      <button
        aria-controls='task-query-panel'
        aria-expanded={isQueryPanelOpen}
        className={styles.filtersButton}
        onClick={onOpenQueryPanel}
        type='button'
      >
        Filter & sort
      </button>
    </section>
  );
}
