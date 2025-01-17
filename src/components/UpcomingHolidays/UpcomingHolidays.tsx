import React from 'react';
import styles from './style.module.css';
import { Holiday} from '../../types/types';

type UpcomingHolidaysProps = {
  nextHolidays: Holiday[];
};

const UpcomingHolidays: React.FC<UpcomingHolidaysProps> = ({ nextHolidays }) => {

  return (
    <div className={styles.nextHolidays}>
      <h3>Upcoming Holidays:</h3>
      <ul>
        {nextHolidays.slice(0, 3).map(holiday => (
          <li key={holiday.date}>
            {new Date(holiday.date).toLocaleDateString()} - {holiday.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UpcomingHolidays;