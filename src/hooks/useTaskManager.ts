import { useState, useEffect } from 'react';

import { GroupedTasks, Task } from '../types/types';

export const useTaskManager = () => {
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});
  const [searchQuery, setSearchQuery] = useState('');

  const formatDateForStorage = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTasksFromStorage = (): GroupedTasks => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : {};
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
      const dateKey = Object.keys(updatedTasks).find(
        date =>
          Array.isArray(updatedTasks[date]) &&
          updatedTasks[date]?.some(task => task && task.id === taskId)
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

  const moveTask = (taskId: string, newDate: string): void => {
    setGroupedTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      const oldDateKey = Object.keys(updatedTasks).find(
        date =>
          Array.isArray(updatedTasks[date]) &&
          updatedTasks[date]?.some(task => task && task.id === taskId)
      );
  
      if (oldDateKey) {
        const taskToMove = updatedTasks[oldDateKey].find(
          task => task && task.id === taskId
        );
        if (taskToMove) {
          updatedTasks[oldDateKey] = updatedTasks[oldDateKey].filter(
            task => task && task.id !== taskId
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

  return {
    groupedTasks,
    searchQuery,
    setSearchQuery,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    handleReorderTasks,
    getFilteredTasksForDate,
    formatDateForStorage
  };
};