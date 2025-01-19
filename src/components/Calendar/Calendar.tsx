import { useState } from 'react';

import TaskList from '../TaskList/TaskList';
import CountrySelect from '../CountrySelect/CountrySelect';
import TaskSearch from '../TaskSearch/TaskSearch';
import UpcomingHolidays from '../UpcomingHolidays/UpcomingHolidays';
import NavControls from '../NavControls/NavControls';
import TodayButton from '../TodayButton/TodayButton';
import { getDaysInMonth, isToday } from '../../utils/dateUtils';
import styles from './Calendar.module.css';
import { useTaskManager } from '../../hooks/useTaskManager';
import { useHolidayManager } from '../../hooks/useHolidayManager';


  const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
  
    const {
      searchQuery,
      setSearchQuery,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      handleReorderTasks,
      getFilteredTasksForDate,
      formatDateForStorage
    } = useTaskManager();
  
    const {
      nextHolidays,
      isTodayHoliday,
      handleCountryChange,
      isLongWeekend,
      getHolidaysForDate
    } = useHolidayManager(currentDate);
  
    const days = getDaysInMonth(currentDate);
  
    return (
      <>
        <header className={styles.header}>
          <NavControls  
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
          
          <TodayButton 
            onTodayClick={() => {
              setSelectedDay(new Date());
              setCurrentDate(new Date());
            }} 
          />
          
          <TaskSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
  
          <CountrySelect onCountryChange={handleCountryChange} />
  
          {isTodayHoliday && (
            <div className={styles.todayHoliday}>
              Today is a public holiday! 🎉
            </div>
          )}
  
          <UpcomingHolidays nextHolidays={nextHolidays} />
        </header>
  
        <main className={styles.grid}>
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`${styles.cell} 
                ${!day ? styles.emptyCell : ''} 
                ${day && isLongWeekend(day) ? styles.longWeekend : ''}
                ${day && isToday(day) ? styles.today : ''}`
              }
            >
              {day && (
                <>
                  <div className={styles.dayNumber}>
                    {day.getDate()}
                  </div>
                  
                  <div className={styles.holidaysContainer}>
                    {getHolidaysForDate(day).map((holiday, idx) => (
                      <div 
                        key={idx} 
                        className={`${styles.holiday} ${holiday.global ? styles.globalHoliday : ''}`}
                        title={`${holiday.localName} (${holiday.name})`}
                      >
                        {holiday.localName || holiday.name}
                      </div>
                    ))}
                  </div>
                  
                  <TaskList
                    tasks={getFilteredTasksForDate(day)}
                    moveTask={moveTask}
                    day={day}
                    onUpdateTask={updateTask}
                    onReorderTasks={(dragIndex, hoverIndex) => 
                      handleReorderTasks(formatDateForStorage(day), dragIndex, hoverIndex)
                    }
                    onDeleteTask={deleteTask}
                  />
                  
                  <button 
                    onClick={() => addTask(day)}
                    className={styles.addButton}
                  >
                    +
                  </button>
                </>
              )}
            </div>
          ))}
        </main>
      </>
    );
  };


export default Calendar;
