import React from 'react';
import styles from './style.module.css';

type NavControlsProps = {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  viewMode: 'month' | 'week';
};

const NavControls: React.FC<NavControlsProps> = ({ currentDate, setCurrentDate, viewMode }) => {
  const getWeekRange = (date: Date) => {
    const currentDay = new Date(date);
    const dayOfWeek = currentDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 

    const startDate = new Date(currentDay);
    startDate.setDate(currentDay.getDate() + diff);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return { startDate, endDate };
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    setCurrentDate((prev: Date) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (viewMode === 'week') {
        const daysToAdd = direction === 'next' ? 7 : -7;
        newDate.setDate(prev.getDate() + daysToAdd);
      }

      return newDate;
    });
  };

  const formatDateRange = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('uk-UA', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else {
      const { startDate, endDate } = getWeekRange(currentDate);
      
      const startFormatted = startDate.toLocaleDateString('uk-UA', { 
        day: 'numeric', 
        month: 'long'
      });
      
      const endFormatted = endDate.toLocaleDateString('uk-UA', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });

      return `${startFormatted} - ${endFormatted}`;
    }
  };

  return (
    <div className={styles.navigationControls}>
      <button
        type="button"
        className={styles.navigationBtn}
        onClick={() => handleDateChange('prev')}
      >
        &lt;
      </button>
      <h2 className={styles.navigationMonth}>
        {formatDateRange()}
      </h2>
      <button
        type="button"
        className={styles.navigationBtn}
        onClick={() => handleDateChange('next')}
      >
        &gt;
      </button>
    </div>
  );
};

export default NavControls;