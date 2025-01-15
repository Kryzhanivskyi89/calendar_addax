import React, { useRef } from 'react';
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
  day
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: any) => {
      const newDate = day.toISOString().split('T')[0];
      if (item.date !== newDate) {
        moveTask(item.id, newDate);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className={`${styles.taskList} ${isOver ? styles.dragOver : ''}`}
    >
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          onUpdate={onUpdateTask}
          onReorder={onReorderTasks}
          onDelete={onDeleteTask}
        />
      ))}
    </div>
  );
};

export default TaskList;