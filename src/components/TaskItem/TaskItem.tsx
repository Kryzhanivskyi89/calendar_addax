import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import styles from './TaskItem.module.css';
import { TaskItemProps } from '../../types/types';

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  onUpdate,
  onReorder,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(task.content);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: {
      id: task.id,
      index,
      date: task.date,
      type: 'task'
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'task',
    hover: (item: any, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onReorder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== task.content) {
      onUpdate(task.id, content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onUpdate(task.id, content);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  return (
    <div
      ref={ref}
      className={`${styles.taskItem} ${isDragging ? styles.dragging : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          className={styles.taskInput}
        />
      ) : (
        <div className={styles.taskContent}>
          <span>{content}</span>
          <button
            onClick={handleDelete}
            className={styles.deleteButton}
            aria-label="Видалити завдання"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
