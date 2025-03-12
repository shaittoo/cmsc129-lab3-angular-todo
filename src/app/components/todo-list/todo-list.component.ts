import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { Task, Priority } from '../../models/task';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TodoItemComponent, TodoFormComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent {
  tasks: Task[] = [];
  sortedTasks: Task[] = [];
  sortBy: 'dateAdded' | 'dueDate' | 'priority' = 'dateAdded';
  showToast = false;
  lastDeletedTask: Task | null = null;
  toastTimeout: any;

  onAddTask(task: Task) {
    const newTask = {
      ...task,
      id: Date.now(),
      createdAt: new Date()
    };
    this.tasks = [...this.tasks, newTask];
    this.sortTasks();
  }

  onToggleComplete(taskId: number) {
    this.tasks = this.tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    this.sortTasks();
  }

  onDeleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      const deletedTask = this.tasks.find(task => task.id === taskId);
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      this.sortTasks();
      
      if (deletedTask) {
        this.showDeleteToast(deletedTask);
      }
    }
  }

  onEditTask(updatedTask: Task) {
    this.tasks = this.tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    this.sortTasks();
  }

  sortTasks() {
    this.sortedTasks = [...this.tasks].sort((a, b) => {
      switch (this.sortBy) {
        case 'dateAdded':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'dueDate':
          const dateA = new Date(`${a.dueDate} ${a.dueTime}`).getTime();
          const dateB = new Date(`${b.dueDate} ${b.dueTime}`).getTime();
          return dateA - dateB;
        case 'priority':
          const priorityOrder = { [Priority.High]: 0, [Priority.Mid]: 1, [Priority.Low]: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });
  }

  showDeleteToast(deletedTask: Task) {
    this.lastDeletedTask = deletedTask;
    this.showToast = true;
    
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  hideToast() {
    this.showToast = false;
    this.lastDeletedTask = null;
  }

  undoDelete() {
    if (this.lastDeletedTask) {
      this.tasks = [...this.tasks, this.lastDeletedTask];
      this.sortTasks();
      this.hideToast();
    }
  }
}
