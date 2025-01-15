import { Task } from '../types/types';

export const storageKeys = {
  TASKS: 'calendar_tasks'
};

export const saveTasksToStorage = (tasks: Task[]) => {
  try {
    localStorage.setItem(storageKeys.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
  }
};

export const getTasksFromStorage = (): Task[] => {
  try {
    const tasksJson = localStorage.getItem(storageKeys.TASKS);
    if (!tasksJson) return [];
    const tasks = JSON.parse(tasksJson);
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error('Error reading tasks from localStorage:', error);
    return [];
  }
};