import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Make sure this URL matches your JSON Server
  private apiUrl = 'http://localhost:3000/tasks';
  
  constructor(private http: HttpClient) {}

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      tap(tasks => console.log('Fetched tasks:', tasks)),
      catchError(this.handleError)
    );
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task, this.httpOptions).pipe(
      tap(newTask => console.log('Added task:', newTask)),
      catchError(this.handleError)
    );
  }

  updateTask(task: Task): Observable<Task> {
    const url = `${this.apiUrl}/${task.id}`;
    console.log('Updating task at:', url, task);
    return this.http.put<Task>(url, task, this.httpOptions).pipe(
      tap(updatedTask => console.log('Updated task:', updatedTask)),
      catchError(this.handleError)
    );
  }

  deleteTask(id: number | string): Observable<any> {
    // Convert ID to string to ensure consistent handling
    const stringId = id.toString();
    const url = `${this.apiUrl}/${stringId}`;
    console.log('Deleting task at:', url);
    
    return this.http.delete(url, this.httpOptions).pipe(
      tap(() => console.log('Delete successful for ID:', stringId)),
      catchError(error => {
        console.error('Delete error:', error);
        throw error;
      })
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
