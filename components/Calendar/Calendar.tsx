
import { useState, useEffect } from 'react';

import TaskList from '../TaskList/TaskList';
import CountrySelect from '../CountrySelect/CountrySelect';
import TaskSearch from '../TaskSearch/TaskSearch'
import UpcomingHolidays from '../UpcomingHolidays/UpcomingHolidays'
import NavControls from '../NavControls/NavControls'
import {Country, Holiday, LongWeekend, Task} from '../../types/types';
import styles from './Calendar.module.css';
import { saveTasksToStorage, getTasksFromStorage } from '../../utils/localStorage';


import { 
  fetchPublicHolidays, 
  fetchAvailableCountries, 
  fetchLongWeekends,
  checkIfTodayIsHoliday,
  fetchNextPublicHolidays,
} from '../../api/holidayApi';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([ ]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('UA');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [longWeekends, setLongWeekends] = useState<LongWeekend[]>([]);
  const [nextHolidays, setNextHolidays] = useState<Holiday[]>([]);
  const [isTodayHoliday, setIsTodayHoliday] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const addTask = (date: Date) => {
    const content = prompt('Введіть текст завдання:');
    if (content) {
      const newTask: Task = {
        id: Date.now().toString(),
        content,
        date: date.toISOString().split('T')[0]
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
  };

  const updateTask = (taskId: string, newContent: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, content: newContent } : task
      )
    );
  };

  const handleReorderTasks = (dragIndex: number, hoverIndex: number) => {
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const [removed] = newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, removed);
      return newTasks;
    });
  };
  
  const filteredTasks = searchQuery
    ? tasks.filter(task => 
        task.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  const moveTask = (taskId: string, newDate: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, date: newDate } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const filterTasksByDate = (tasks: Task[], date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => task.date === dateString);
  };

  useEffect(() => {
    const savedTasks = getTasksFromStorage();
    if (savedTasks.length > 0) {
      setTasks(savedTasks);
    }
  }, []);
  
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasksToStorage(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchAvailableCountries();
        setCountries(data);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const loadHolidayData = async () => {
      try {
        const [holidaysData, longWeekendsData, nextHolidaysData, todayHoliday] = await Promise.all([
          fetchPublicHolidays(currentDate.getFullYear(), selectedCountry),
          fetchLongWeekends(currentDate.getFullYear(), selectedCountry),
          fetchNextPublicHolidays(selectedCountry),
          checkIfTodayIsHoliday(selectedCountry)
        ]);

        setHolidays(holidaysData);
        setLongWeekends(longWeekendsData);
        setNextHolidays(nextHolidaysData);
        setIsTodayHoliday(todayHoliday);
      } catch (error) {
        console.error('Failed to fetch holiday data:', error);
      }
    };

    loadHolidayData();
  }, [currentDate, selectedCountry]);

  const isLongWeekend = (date: Date | null): boolean => {
    if (!date) return false;
    
    return longWeekends.some(weekend => {
      const start = new Date(weekend.startDate);
      const end = new Date(weekend.endDate);
      return date >= start && date <= end;
    });
  };

  const getHolidaysForDate = (date: Date | null) => {
    if (!date) return [];
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
  
    // const dateString = targetDate.toISOString().split('T')[0];
    
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      
      // Порівнюємо дати
      return holidayDate.getTime() === targetDate.getTime();
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <>
      <header className={styles.header}>
        {/* <div className={styles.container}> */}

        <NavControls  
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        /> 
       
        <TaskSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        /> 

        <CountrySelect/> 

        {isTodayHoliday && (
          <div className={styles.todayHoliday}>
            Today is a public holiday! 🎉
          </div>
        )}

        <UpcomingHolidays nextHolidays={nextHolidays}/> 

      </header>

      <main className={styles.grid}>
        {days.map((day, index) => (
          <div key={index} className={`${styles.cell} 
            ${!day ? styles.emptyCell : ''} 
            ${isLongWeekend(day) ? styles.longWeekend : ''}`
          }>

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
                  tasks={filterTasksByDate(filteredTasks, day)}
                  moveTask={moveTask}
                  day={day}
                  onUpdateTask={updateTask}
                  onReorderTasks={handleReorderTasks}
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

    {/* </div> */}
    </>
  );
};

export default Calendar;