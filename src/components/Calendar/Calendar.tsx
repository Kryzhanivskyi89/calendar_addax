
import { useState, useEffect } from 'react';

import TaskList from '../TaskList/TaskList';
import CountrySelect from '../CountrySelect/CountrySelect';
import TaskSearch from '../TaskSearch/TaskSearch'
import UpcomingHolidays from '../UpcomingHolidays/UpcomingHolidays'
import NavControls from '../NavControls/NavControls'
import TodayButton from '../TodayButton/TodayButton'
import {Country, Holiday, LongWeekend, Task, GroupedTasks} from '../../types/types';
import styles from './Calendar.module.css';

import { 
  fetchPublicHolidays, 
  fetchAvailableCountries, 
  fetchLongWeekends,
  checkIfTodayIsHoliday,
  fetchNextPublicHolidays,
} from '../../api/holidayApi';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('UA');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [longWeekends, setLongWeekends] = useState<LongWeekend[]>([]);
  const [nextHolidays, setNextHolidays] = useState<Holiday[]>([]);
  const [isTodayHoliday, setIsTodayHoliday] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date());

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days: (Date | null)[] = [];
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateForStorage = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTasksFromStorage = (): GroupedTasks => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return {};
  };

  const saveTasksToStorage = (tasks: GroupedTasks): void => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const addTask = (date: Date): void => {
    const content = prompt('Введіть текст завдання:');
    if (content) {
      const dateKey = formatDateForStorage(date);
      const newTask: Task = {
        id: Date.now().toString(),
        content,
        date: dateKey
      };

      setGroupedTasks(prevTasks => {
        const updatedTasks = {
          ...prevTasks,
          [dateKey]: [...(prevTasks[dateKey] || []), newTask]
        };
        saveTasksToStorage(updatedTasks);
        return updatedTasks;
      });
    }
  };

  const updateTask = (taskId: string, newContent: string): void => {
    setGroupedTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      
      const dateKey = Object.keys(updatedTasks).find(date => 
        updatedTasks[date].some(task => task.id === taskId)
      );

      if (dateKey) {
        updatedTasks[dateKey] = updatedTasks[dateKey].map(task =>
          task.id === taskId ? { ...task, content: newContent } : task
        );
        saveTasksToStorage(updatedTasks);
      }

      return updatedTasks;
    });
  };

  const handleReorderTasks = (dateKey: string, dragIndex: number, hoverIndex: number): void => {
    setGroupedTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      const dayTasks = [...(updatedTasks[dateKey] || [])];
      const [removed] = dayTasks.splice(dragIndex, 1);
      dayTasks.splice(hoverIndex, 0, removed);
      updatedTasks[dateKey] = dayTasks;
      saveTasksToStorage(updatedTasks);
      return updatedTasks;
    });
  };

  const moveTask = (taskId: string, newDate: string): void => {
    setGroupedTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      
      const oldDateKey = Object.keys(updatedTasks).find(date => 
        updatedTasks[date].some(task => task.id === taskId)
      );

      if (oldDateKey) {
        const taskToMove = updatedTasks[oldDateKey].find(task => task.id === taskId);
        if (taskToMove) {
          updatedTasks[oldDateKey] = updatedTasks[oldDateKey].filter(
            task => task.id !== taskId
          );
          
          updatedTasks[newDate] = [
            ...(updatedTasks[newDate] || []),
            { ...taskToMove, date: newDate }
          ];

          if (updatedTasks[oldDateKey].length === 0) {
            delete updatedTasks[oldDateKey];
          }

          saveTasksToStorage(updatedTasks);
        }
      }

      return updatedTasks;
    });
  };

  const deleteTask = (taskId: string): void => {
    setGroupedTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      
      Object.keys(updatedTasks).forEach(dateKey => {
        const filteredTasks = updatedTasks[dateKey].filter(
          task => task.id !== taskId
        );
        
        if (filteredTasks.length === 0) {
          delete updatedTasks[dateKey];
        } else {
          updatedTasks[dateKey] = filteredTasks;
        }
      });

      saveTasksToStorage(updatedTasks);
      return updatedTasks;
    });
  };

  const getFilteredTasksForDate = (date: Date): Task[] => {
    const dateKey = formatDateForStorage(date);
    const dateTasks = groupedTasks[dateKey] || [];
    
    if (!searchQuery) {
      return dateTasks;
    }

    return dateTasks.filter(task =>
      task.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    const savedTasks = getTasksFromStorage();
    setGroupedTasks(savedTasks);
  }, []);

  const days = getDaysInMonth(currentDate);

  const handleCountryChange = async (countryCode: string) => {
    try {
      const holidaysData = await fetchPublicHolidays(currentDate.getFullYear(), countryCode);
      setHolidays(holidaysData);
      const [longWeekendsData, nextHolidaysData, todayHoliday] = await Promise.all([
        fetchLongWeekends(currentDate.getFullYear(), countryCode),
        fetchNextPublicHolidays(countryCode),
        checkIfTodayIsHoliday(countryCode)
      ]);
  
      setLongWeekends(longWeekendsData);
      setNextHolidays(nextHolidaysData);
      setIsTodayHoliday(todayHoliday);
      setSelectedCountry(countryCode);
    } catch (error) {
      console.error('Помилка завантаження свят:', error);
    }
  };

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
  
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      
      return holidayDate.getTime() === targetDate.getTime();
    });
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

 return (
    <>
      <header className={styles.header}>
        <NavControls  
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        /> 
        
        <TodayButton onTodayClick={() => {
          setSelectedDay(new Date());
          setCurrentDate(new Date());
        }} />
       
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

// import { useState, useEffect } from 'react';

// import TaskList from '../TaskList/TaskList';
// import CountrySelect from '../CountrySelect/CountrySelect';
// import TaskSearch from '../TaskSearch/TaskSearch'
// import UpcomingHolidays from '../UpcomingHolidays/UpcomingHolidays'
// import NavControls from '../NavControls/NavControls'
// import TodayButton from '../TodayButton/TodayButton'
// import {Country, Holiday, LongWeekend, Task} from '../../types/types';
// import styles from './Calendar.module.css';
// import { saveTasksToStorage, getTasksFromStorage } from '../../utils/localStorage';

// import { 
//   fetchPublicHolidays, 
//   fetchAvailableCountries, 
//   fetchLongWeekends,
//   checkIfTodayIsHoliday,
//   fetchNextPublicHolidays,
// } from '../../api/holidayApi';

// const Calendar = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [tasks, setTasks] = useState<Task[]>([ ]);
//   const [countries, setCountries] = useState<Country[]>([]);
//   const [selectedCountry, setSelectedCountry] = useState('UA');
//   const [holidays, setHolidays] = useState<Holiday[]>([]);
//   const [longWeekends, setLongWeekends] = useState<LongWeekend[]>([]);
//   const [nextHolidays, setNextHolidays] = useState<Holiday[]>([]);
//   const [isTodayHoliday, setIsTodayHoliday] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedDay, setSelectedDay] = useState(new Date());
  
//   const getDaysInMonth = (date: Date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     const firstDay = new Date(year, month, 1).getDay();
    
//     const days = [];
//     const offset = firstDay === 0 ? 6 : firstDay - 1;
    
//     for (let i = 0; i < offset; i++) {
//       days.push(null);
//     }
    
//     for (let day = 1; day <= daysInMonth; day++) {
//       days.push(new Date(year, month, day));
//     }
    
//     return days;
//   };

//   const addTask = (date: Date) => {
//     const content = prompt('Введіть текст завдання:');
//     if (content) {
//       const newTask: Task = {
//         id: Date.now().toString(),
//         content,
//         date: date.toISOString().split('T')[0]
//       };
//       setTasks(prevTasks => {
//         const updatedTasks = [...prevTasks, newTask];
//         saveTasksToStorage(updatedTasks); 
//         return updatedTasks;
//       });
      
//     }
//   };

//   const updateTask = (taskId: string, newContent: string) => {
//     setTasks(prevTasks => {
//       const updatedTasks = prevTasks.map(task =>
//         task.id === taskId ? { ...task, content: newContent } : task
//       );
//       saveTasksToStorage(updatedTasks);
//       return updatedTasks;
//     });
//   };
  
//   useEffect(() => {
//     const savedTasks = getTasksFromStorage();
//     if (savedTasks.length > 0) {
//       setTasks(savedTasks);
//     }
//   }, []);
  
//   useEffect(() => {
//     if (tasks.length > 0) {
//       saveTasksToStorage(tasks);
//     }
//   }, [tasks]);

//   const handleReorderTasks = (dragIndex: number, hoverIndex: number) => {
//     setTasks(prevTasks => {
//       const newTasks = [...prevTasks];
//       const [removed] = newTasks.splice(dragIndex, 1);
//       newTasks.splice(hoverIndex, 0, removed);
//       return newTasks;
//     });
//   };
  
//   const filterTasksByDate = (tasks: Task[], date: Date) => {
//     const dateString = date.toISOString().split('T')[0];
//     return tasks.filter(task => task.date === dateString);
//   };
  
//   const filteredTasks = searchQuery
//     ? tasks.filter(task => 
//         task.content.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     : tasks;

//   const moveTask = (taskId: string, newDate: string) => {
//     setTasks(prevTasks =>
//       prevTasks.map(task =>
//         task.id === taskId ? { ...task, date: newDate } : task
//       )
//     );
//   };

//   const deleteTask = (taskId: string) => {
//     setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
//   };

//   const handleCountryChange = async (countryCode: string) => {
//     try {
//       const holidaysData = await fetchPublicHolidays(currentDate.getFullYear(), countryCode);
//       setHolidays(holidaysData);
//       const [longWeekendsData, nextHolidaysData, todayHoliday] = await Promise.all([
//         fetchLongWeekends(currentDate.getFullYear(), countryCode),
//         fetchNextPublicHolidays(countryCode),
//         checkIfTodayIsHoliday(countryCode)
//       ]);
  
//       setLongWeekends(longWeekendsData);
//       setNextHolidays(nextHolidaysData);
//       setIsTodayHoliday(todayHoliday);
//       setSelectedCountry(countryCode);
//     } catch (error) {
//       console.error('Помилка завантаження свят:', error);
//     }
//   };

//   useEffect(() => {
//     const loadHolidayData = async () => {
//       try {
//         const [holidaysData, longWeekendsData, nextHolidaysData, todayHoliday] = await Promise.all([
//           fetchPublicHolidays(currentDate.getFullYear(), selectedCountry),
//           fetchLongWeekends(currentDate.getFullYear(), selectedCountry),
//           fetchNextPublicHolidays(selectedCountry),
//           checkIfTodayIsHoliday(selectedCountry)
//         ]);

//         setHolidays(holidaysData);
//         setLongWeekends(longWeekendsData);
//         setNextHolidays(nextHolidaysData);
//         setIsTodayHoliday(todayHoliday);
//       } catch (error) {
//         console.error('Failed to fetch holiday data:', error);
//       }
//     };

//     loadHolidayData();
//   }, [currentDate, selectedCountry]);
  
  

//   useEffect(() => {
//     const loadCountries = async () => {
//       try {
//         const data = await fetchAvailableCountries();
//         setCountries(data);
//       } catch (error) {
//         console.error('Failed to fetch countries:', error);
//       }
//     };
//     loadCountries();
//   }, []);

//   const isLongWeekend = (date: Date | null): boolean => {
//     if (!date) return false;
    
//     return longWeekends.some(weekend => {
//       const start = new Date(weekend.startDate);
//       const end = new Date(weekend.endDate);
//       return date >= start && date <= end;
//     });
//   };

//   const getHolidaysForDate = (date: Date | null) => {
//     if (!date) return [];
    
//     const targetDate = new Date(date);
//     targetDate.setHours(0, 0, 0, 0);
  
//     // const dateString = targetDate.toISOString().split('T')[0];
    
//     return holidays.filter(holiday => {
//       const holidayDate = new Date(holiday.date);
//       holidayDate.setHours(0, 0, 0, 0);
      
//       return holidayDate.getTime() === targetDate.getTime();
//     });
//   };

//   const handleTodayClick = () => {
//     setSelectedDay(new Date());  
//     setCurrentDate(new Date());  
//   };

//   const isToday = (day: Date) => {
//     const today = new Date();
//     return (
//       day.getDate() === today.getDate() &&
//       day.getMonth() === today.getMonth() &&
//       day.getFullYear() === today.getFullYear()
//     );
//   };
//   const days = getDaysInMonth(currentDate);

//   return (
//     <>
//       <header className={styles.header}>

//         <NavControls  
//           currentDate={currentDate}
//           setCurrentDate={setCurrentDate}
//         /> 
        
//         <TodayButton onTodayClick={handleTodayClick} />
       
//         <TaskSearch
//           searchQuery={searchQuery}
//           setSearchQuery={setSearchQuery}
//         /> 

//         <CountrySelect onCountryChange={handleCountryChange}/> 

//         {isTodayHoliday && (
//           <div className={styles.todayHoliday}>
//             Today is a public holiday! 🎉
//           </div>
//         )}

//         <UpcomingHolidays nextHolidays={nextHolidays}/> 
        
//       </header>

//       <main className={styles.grid}>
//         {days.map((day, index) => (
//           <div key={index} className={`${styles.cell} 
//             ${!day ? styles.emptyCell : ''} 
//             ${isLongWeekend(day) ? styles.longWeekend : ''}
//             ${day && isToday(day) ? styles.today : ''}`
//           }>

//             {day && (
//               <>
//                 <div className={styles.dayNumber}>
//                   {day.getDate()}
//                 </div>
                
//                 <div className={styles.holidaysContainer}>
//                   {getHolidaysForDate(day).map((holiday, idx) => (
//                     <div 
//                       key={idx} 
//                       className={`${styles.holiday} ${holiday.global ? styles.globalHoliday : ''}`}
//                       title={`${holiday.localName} (${holiday.name})`}
//                     >
//                       {holiday.localName || holiday.name}
//                     </div>
//                   ))}
//                 </div>
                
//                 <TaskList
//                   tasks={filterTasksByDate(filteredTasks, day)}
//                   moveTask={moveTask}
//                   day={day}
//                   onUpdateTask={updateTask}
//                   onReorderTasks={handleReorderTasks}
//                   onDeleteTask={deleteTask} 
//                 />
                
//                 <button 
//                   onClick={() => addTask(day)}
//                   className={styles.addButton}
//                 >
//                   +
//                 </button>
//               </>
//             )}
//           </div>
//         ))}
//       </main>

//     </>
//   );
// };

// export default Calendar;