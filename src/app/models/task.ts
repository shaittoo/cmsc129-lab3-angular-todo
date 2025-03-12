export enum Priority {
  High = 'High',
  Mid = 'Mid',
  Low = 'Low'
}

export interface Task {
  id: string | number;
  title: string;
  completed: boolean;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  createdAt: string;
} 