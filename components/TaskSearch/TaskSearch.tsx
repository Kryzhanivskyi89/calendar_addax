import React from 'react';
import styles from './style.module.css';

type TaskSearchProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

const TaskSearch: React.FC<TaskSearchProps> = ({ searchQuery, setSearchQuery }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value); 
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Пошук завдань..."
        value={searchQuery}
        onChange={handleSearchChange}
        className={styles.searchInput}
      />
    </div>
  );
};

export default TaskSearch;