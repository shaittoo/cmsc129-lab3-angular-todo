import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, Priority } from '../../models/task';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.css']
})
export class TodoFormComponent {
  @Output() addTask = new EventEmitter<Task>();
  
  //form field properties with initial values
  Priority = Priority;
  title: string = '';
  dueDate: string = '';
  dueTime: string = '';
  priority: Priority = Priority.Mid;

  onSubmit() {
    if (this.title.trim()) {
      const newTask: Task = {
        id: 0,
        title: this.title.trim(),
        completed: false,
        dueDate: this.dueDate,
        dueTime: this.dueTime,
        priority: this.priority,
        createdAt: new Date().toISOString()
      };
      
      this.addTask.emit(newTask);
      this.resetForm();
    }
  }

  //reset form fields to empty values
  private resetForm() {
    this.title = '';
    this.dueDate = '';
    this.dueTime = '';
    this.priority = Priority.Mid;
  }
}
