import React from 'react';
import styles from './style.module.css';

type ViewModeToggleProps = {
  viewMode: 'month' | 'week';
  setViewMode: React.Dispatch<React.SetStateAction<'month' | 'week'>>;
};

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className={styles.viewModeToggle}>
      <button 
        onClick={() => setViewMode('month')} 
        className={`${styles.toggleButton} ${viewMode === 'month' ? styles.activeButton : ''}`}
      >
        Місяць
      </button>
      <button 
        onClick={() => setViewMode('week')} 
        className={`${styles.toggleButton} ${viewMode === 'week' ? styles.activeButton : ''}`}
      >
        Тиждень
      </button>
    </div>
  );
};

export default ViewModeToggle;