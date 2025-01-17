export interface Country {
  countryCode: string;
  name: string;
}

export interface Holiday {
  date: string;
  name: string;
  localName: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export interface LongWeekend {
  startDate: string;
  endDate: string;
  dayCount: number;
}

export interface CountryInfo {
  commonName: string;
  officialName: string;
  countryCode: string;
  region: string;
  borders: string[];
}

export interface Task {
  id: string;
  content: string;
  date: string;
}

export interface TaskListProps {
  tasks: Task[];
  moveTask: (taskId: string, newDate: string) => void;
  onUpdateTask: (taskId: string, newContent: string) => void;
  onReorderTasks: (dragIndex: number, hoverIndex: number) => void;
  onDeleteTask: (taskId: string) => void;
  day: Date;
}

export interface TaskItemProps {
  task: Task;
  index: number;
  onUpdate: (taskId: string, newContent: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (taskId: string) => void;
}

export interface TodayButtonProps {
  onTodayClick: () => void;
}

export type GroupedTasks = {
  [date: string]: Task[];
};