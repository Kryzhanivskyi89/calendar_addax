
interface Task {
    id: string;
    content: string;
    date: string;
}

const TaskCell = ({ task, updateTask }: { task: Task, updateTask: (updatedTask: Task) => void }) => {
    const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
      const updatedTask = { ...task, content: e.target.textContent || '' };
      updateTask(updatedTask);
    };
  
    return (
      <div 
        // className={styles.taskCell}
        contentEditable
        onInput={handleChange}
      >
        {task.content}
      </div>
    );
  };

  export default TaskCell;