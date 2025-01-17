import React from 'react';
import styles from './style.module.css';
import {TodayButtonProps} from '../../types/types'

const TodayButton: React.FC<TodayButtonProps> = ({ onTodayClick }) => {
  return (
    <button onClick={onTodayClick} className={styles.todayButton}>
      Сьогодні
    </button>
  );
};

export default TodayButton;