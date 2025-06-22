import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model'; // Import Employee model

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToEmployeeId: string;
  assignedToEmployee?: Employee; // Navigation property from backend
  dueDate: Date;
  priority: string; // e.g., High, Medium, Low
  status: string; // e.g., Pending, In Progress, Completed
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  baseApiUrl: string = 'https://localhost:7035';

  constructor(private http: HttpClient) { }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseApiUrl + '/api/Task');
  }

  addTask(addTaskRequest: Omit<Task, 'id' | 'assignedToEmployee' | 'status'>): Observable<Task> {
    return this.http.post<Task>(this.baseApiUrl + '/api/Task', addTaskRequest);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(this.baseApiUrl + '/api/Task/' + id);
  }

  updateTask(id: string, updateTaskRequest: Omit<Task, 'assignedToEmployee'>): Observable<Task> {
    return this.http.put<Task>(this.baseApiUrl + '/api/Task/' + id, updateTaskRequest);
  }

  deleteTask(id: string): Observable<Task> {
    return this.http.delete<Task>(this.baseApiUrl + '/api/Task/' + id);
  }

  getTasksByEmployeeId(empId: string): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseApiUrl + '/api/Task/employee/' + empId);
  }
}
