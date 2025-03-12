export enum Priority {
  High = 'High',
  Mid = 'Mid',
  Low = 'Low'
}

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string;
  dueTime: string;
  createdAt: Date;
  priority: Priority;
} 