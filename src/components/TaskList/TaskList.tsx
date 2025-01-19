
import React, { useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';

import TaskItem from '../TaskItem/TaskItem';
import styles from './TaskList.module.css';
import { TaskListProps } from '../../types/types';

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  moveTask,
  onUpdateTask,
  onReorderTasks,
  onDeleteTask,
  day,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const formatDateForDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: any) => {
      const newDate = formatDateForDisplay(day);
      if (item.date !== newDate) {
        moveTask(item.id, newDate);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(ref);

  const memoizedUpdateTask = useCallback(onUpdateTask, [onUpdateTask]);
  const memoizedReorderTasks = useCallback(onReorderTasks, [onReorderTasks]);
  const memoizedDeleteTask = useCallback(onDeleteTask, [onDeleteTask]);

  const currentDayTasks = (tasks || []).filter(
    task => task && task.date === formatDateForDisplay(day)
  );

  return (
    <div
      ref={ref}
      className={`${styles.taskList} ${isOver ? styles.dragOver : ''}`}
    >
      {currentDayTasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          onUpdate={memoizedUpdateTask}
          onReorder={memoizedReorderTasks}
          onDelete={memoizedDeleteTask}
        />
      ))}
    </div>
  );
};

export default TaskList;
