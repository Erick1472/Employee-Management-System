import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model'; // Import Employee model

export interface Salary {
  id: string;
  employeeId: string; // This will be the Guid of the Employee
  employee?: Employee; // Added to match backend, contains full employee object
  employeeName?: string; // Optional: To display employee name in frontend (can be derived from employee object now)
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: string;
  paymentDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SalariesService {

  baseApiUrl: string = 'https://localhost:7035';

  constructor(private http: HttpClient) { }

  getAllSalaryRecords(): Observable<Salary[]> {
    return this.http.get<Salary[]>(this.baseApiUrl + '/api/Salary');
  }

  addSalaryRecord(addSalaryRequest: Omit<Salary, 'id' | 'netSalary' | 'employee' | 'employeeName'>): Observable<Salary> {
    return this.http.post<Salary>(this.baseApiUrl + '/api/Salary', addSalaryRequest);
  }

  getSalaryRecord(id: string): Observable<Salary> {
    return this.http.get<Salary>(this.baseApiUrl + '/api/Salary/' + id);
  }

  updateSalaryRecord(id: string, updateSalaryRequest: Omit<Salary, 'netSalary' | 'employee' | 'employeeName'>): Observable<Salary> {
    return this.http.put<Salary>(this.baseApiUrl + '/api/Salary/' + id, updateSalaryRequest);
  }

  deleteSalaryRecord(id: string): Observable<Salary> {
    return this.http.delete<Salary>(this.baseApiUrl + '/api/Salary/' + id);
  }
}
