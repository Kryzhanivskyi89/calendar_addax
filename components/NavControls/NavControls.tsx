import React from 'react';
import styles from './style.module.css';

type NavControlsProps = {
  currentDate: Date; 
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
};

const NavControls: React.FC<NavControlsProps> = ({ currentDate, setCurrentDate }) => {
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate((prev: Date) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  return (
    <div className={styles.navigationControls}>
      <button type='button' className={styles.navigationBtn} onClick={() => handleMonthChange('prev')}>&lt;</button>
      <h2 className={styles.navigationMonth}>
        {currentDate.toLocaleDateString('uk-UA', { 
          month: 'long', 
          year: 'numeric' 
        })}
      </h2>
      <button type='button' className={styles.navigationBtn} onClick={() => handleMonthChange('next')}>&gt;</button>
    </div>
  );
};

export default NavControls;