import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepartmentPerformance, EmployeePerformance, TopPerformer } from '../models/performance.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private baseUrl = 'https://localhost:7035/api'; // Adjusted base URL to match running backend

  constructor(private http: HttpClient) { }

  getDepartmentPerformance(): Observable<DepartmentPerformance[]> {
    // TODO: Implement API call to get department performance data
    return this.http.get<DepartmentPerformance[]>(`${this.baseUrl}/performance/departments`);
  }

  getEmployeePerformance(): Observable<EmployeePerformance[]> {
    // TODO: Implement API call to get employee performance data
    return this.http.get<EmployeePerformance[]>(`${this.baseUrl}/performance/employees`);
  }

  getTopPerformers(): Observable<TopPerformer[]> {
    return this.http.get<any[]>(`${this.baseUrl}/performance/top-performers`).pipe(
      map(data => data.map(item => ({
        name: item.employeeName || item.name,
        department: item.department || '',
        position: item.position || '',
        score: item.score,
        lastEvent: item.lastEvent ? new Date(item.lastEvent) : undefined
      })))
    );
  }

  getEmployeePerformanceById(empId: string): Observable<EmployeePerformance> {
    return this.http.get<EmployeePerformance>(`${this.baseUrl}/performance/employee/${empId}`);
  }

  getPerformanceFeed(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/performance/feed`);
  }

  getNeedsAttention(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/performance/needs-attention`);
  }

  getEmployeeSnapshot(empId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/performance/employee/${empId}/snapshot`);
  }

  getEmployeeTimeline(empId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/performance/employee/${empId}/timeline`);
  }
} 