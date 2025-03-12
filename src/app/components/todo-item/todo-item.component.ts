import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, Priority } from '../../models/task';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.css']
})
export class TodoItemComponent {
  @Input() task!: Task;
  @Output() toggleComplete = new EventEmitter<string | number>();
  @Output() deleteTask = new EventEmitter<string | number>();
  @Output() editTask = new EventEmitter<Task>();

  Priority = Priority;
  isEditing = false;
  editedTitle = '';
  editedDueDate = '';
  editedDueTime = '';
  editedPriority: Priority = Priority.Mid;

  getPriorityClass() {
    return {
      'border-l-4': true,
      'border-red-500': this.task.priority === Priority.High,
      'border-yellow-500': this.task.priority === Priority.Mid,
      'border-green-500': this.task.priority === Priority.Low
    };
  }

  onToggle() {
    this.toggleComplete.emit(this.task.id);
  }

  onDelete() {
    this.deleteTask.emit(this.task.id);
  }

  startEditing() {
    this.isEditing = true;
    this.editedTitle = this.task.title;
    this.editedDueDate = this.task.dueDate;
    this.editedDueTime = this.task.dueTime;
    this.editedPriority = this.task.priority;
    console.log('Starting edit mode', this.isEditing);
  }

  saveEdit() {
    if (this.editedTitle.trim()) {
      const updatedTask: Task = {
        ...this.task,
        title: this.editedTitle.trim(),
        dueDate: this.editedDueDate,
        dueTime: this.editedDueTime,
        priority: this.editedPriority,
        completed: this.task.completed,
        createdAt: this.task.createdAt
      };
      
      console.log('Sending task update with ID:', updatedTask.id);
      this.editTask.emit(updatedTask);
      this.isEditing = false;
    }
  }
}
