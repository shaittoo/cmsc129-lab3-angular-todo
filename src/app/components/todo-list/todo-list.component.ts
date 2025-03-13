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

  ngOnInit() { //loads the tasks when the component is initialized
    this.loadTasks();
  }
  
  //loads the tasks from the task service
  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.sortedTasks = [...tasks];
        this.sortTasks();
        console.log('Tasks loaded:', this.tasks);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  onAddTask(task: Task) {
    const newTask: Task = { 
      ...task, //
      id: Date.now().toString(), 
      createdAt: new Date().toISOString()
    };
    
    console.log('Creating new task:', newTask); 
    
    this.taskService.addTask(newTask).subscribe({ 
      next: (savedTask) => { 
        const taskWithStringId = { 
          ...savedTask,
          id: savedTask.id.toString()
        };
        this.tasks = [...this.tasks, taskWithStringId]; //adds the new task to the tasks array
        this.sortedTasks = [...this.tasks]; //updates the sorted tasks array
        this.sortTasks(); 
        console.log('Task added successfully:', taskWithStringId);
      },
      error: (error) => {
        console.error('Error adding task:', error);
      }
    });
  }

  onToggleComplete(taskId: string | number) { 
    const stringId = taskId.toString(); 
    const task = this.tasks.find(t => t.id.toString() === stringId); //finds the task with the matching id
    if (task) {
      const updatedTask = { ...task, completed: !task.completed }; //updates the completed property of the task
      this.taskService.updateTask(updatedTask).subscribe({
        next: () => {
          this.tasks = this.tasks.map(t => 
            t.id.toString() === stringId ? updatedTask : t 
          ); //updates the tasks array with the updated task
          this.sortTasks();
        },
        error: (error) => {
          console.error('Error updating task:', error);
        }
      });
    }
  }

  onDeleteTask(taskId: number | string) { 
    if (confirm('Are you sure you want to delete this task?')) { 
      const stringId = taskId.toString(); 
      console.log('Attempting to delete task:', stringId); 
      
      const taskToDelete = this.tasks.find(task => task.id.toString() === stringId); 
      if (!taskToDelete) {
        console.error('Task not found:', stringId);
        return;
      }

      const previousTasks = [...this.tasks]; 
      
      this.tasks = this.tasks.filter(task => task.id.toString() !== stringId);
      this.sortedTasks = this.sortedTasks.filter(task => task.id.toString() !== stringId);
      this.sortTasks();

      this.taskService.deleteTask(stringId).subscribe({ 
        next: () => {
          console.log('Task deleted successfully:', stringId);
          this.showDeleteToast(taskToDelete);
        },
        error: (error) => {
          console.error('Delete failed:', error);
          this.tasks = previousTasks;
          this.sortedTasks = [...this.tasks];
          this.sortTasks();
        }
      });
    }
  }

  onEditTask(updatedTask: Task) { 
    console.log('Editing task:', updatedTask);
    
    const taskToUpdate: Task = { //creates a new task object with the edited values
      ...updatedTask,
      id: updatedTask.id.toString(),
      title: updatedTask.title.trim(),
      completed: updatedTask.completed,
      dueDate: updatedTask.dueDate,
      dueTime: updatedTask.dueTime,
      priority: updatedTask.priority,
      createdAt: updatedTask.createdAt
    };

    this.tasks = this.tasks.map(task =>  //updates the tasks array with the edited task
      task.id.toString() === taskToUpdate.id.toString() ? taskToUpdate : task
    );
    this.sortedTasks = [...this.tasks];
    this.sortTasks(); 

    this.taskService.updateTask(taskToUpdate).subscribe({ 
      next: () => {
        console.log('Task updated successfully');
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.loadTasks();
      }
    });
  }

  sortTasks() {
    this.sortedTasks = [...this.tasks].sort((a, b) => { 
      switch (this.sortBy) { 
        case 'dateAdded':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); 
        case 'dueDate':
          return new Date(`${a.dueDate} ${a.dueTime}`).getTime() - 
                 new Date(`${b.dueDate} ${b.dueTime}`).getTime();
        case 'priority':
          const priorityOrder: Record<Priority, number> = { 
            [Priority.High]: 0, 
            [Priority.Mid]: 1, 
            [Priority.Low]: 2 
          };
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
      // First, try to add the task back to the database
      this.taskService.addTask(this.lastDeletedTask).subscribe({
        next: (restoredTask) => {
          // On success, update the UI with the restored task
          const taskWithStringId = {
            ...restoredTask,
            id: restoredTask.id.toString()
          };
          
          this.tasks = [...this.tasks, taskWithStringId];
          this.sortedTasks = [...this.tasks];
          this.sortTasks();
          
          //clear the toast
          this.hideToast();
          
          console.log('Task restored successfully:', taskWithStringId);
        },
        error: (error) => {
          console.error('Error restoring task:', error);
          alert('Failed to restore task. Please try again.');
          this.hideToast();
        }
      });
    }
  }
}
