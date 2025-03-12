import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { Task, Priority } from '../../models/task';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TodoItemComponent, TodoFormComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
  tasks: Task[] = [];
  sortedTasks: Task[] = [];
  sortBy: 'dateAdded' | 'dueDate' | 'priority' = 'dateAdded';
  showToast = false;
  lastDeletedTask: Task | null = null;
  toastTimeout: any;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
        this.sortedTasks = [...this.tasks];
        this.sortTasks();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  onAddTask(task: Task) {
    const newTask = {
      ...task,
      id: Date.now(),
      createdAt: new Date()
    };
    
    this.taskService.addTask(newTask).subscribe({
      next: (savedTask) => {
        this.tasks = [...this.tasks, savedTask];
        this.sortedTasks = [...this.tasks];
        this.sortTasks();
        console.log('Tasks after adding:', this.tasks);
      },
      error: (error) => {
        console.error('Error adding task:', error);
      }
    });
  }

  onToggleComplete(taskId: number) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed };
      this.taskService.updateTask(updatedTask).subscribe({
        next: () => {
          this.tasks = this.tasks.map(t => 
            t.id === taskId ? updatedTask : t
          );
          this.sortTasks();
        },
        error: (error) => {
          console.error('Error updating task:', error);
        }
      });
    }
  }

  onDeleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      const deletedTask = this.tasks.find(task => task.id === taskId);
      
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(task => task.id !== taskId);
          this.sortedTasks = this.sortedTasks.filter(task => task.id !== taskId);
          
          if (deletedTask) {
            this.showDeleteToast(deletedTask);
          }
          console.log('Task deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  onEditTask(updatedTask: Task) {
    this.taskService.updateTask(updatedTask).subscribe({
      next: (response) => {
        this.tasks = this.tasks.map(task => 
          task.id === updatedTask.id ? response : task
        );
        this.sortedTasks = [...this.tasks];
        this.sortTasks();
        console.log('Task updated successfully');
      },
      error: (error) => {
        console.error('Error updating task:', error);
      }
    });
  }

  sortTasks() {
    this.sortedTasks = [...this.tasks].sort((a, b) => {
      switch (this.sortBy) {
        case 'dateAdded':
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        case 'dueDate':
          const dueDateA = new Date(`${a.dueDate} ${a.dueTime}`).getTime();
          const dueDateB = new Date(`${b.dueDate} ${b.dueTime}`).getTime();
          return dueDateA - dueDateB;
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
