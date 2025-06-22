import { HttpClient } from '@angular/common/http'; //Import this library manually, or add "typeRoots" into tsconfig.json file 
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Employee } from '../models/employee.model';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  private baseApiUrl = 'https://localhost:7035';

  constructor(private http: HttpClient) { }
  
  // Function to talk with DotNet6_WebAPI
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseApiUrl + '/api/employees').pipe(
      map(employees => employees.map(emp => ({ ...emp, id: emp.id }))),
      catchError(this.handleError)
    );
  }

  // Private helper method to log and re-throw errors (so that catchError(this.handleError) compiles)
  private handleError(err: any) {
    console.error(err);
    return throwError(() => err);
  }

  addEmployee(addEmployeeRequest: Omit<Employee, 'empId' | 'id'>): Observable<Employee> {
    // Note: The backend expects empId to be generated, so we might not send it if it's auto-generated
    return this.http.post<Employee>(this.baseApiUrl + '/api/employees', addEmployeeRequest);
  }

  getEmployee(empId: string): Observable<Employee> {
    // Ensure the full EmpId is sent, including the 'Emp' prefix
    return this.http.get<Employee>(this.baseApiUrl + '/api/employees/' + empId);
  }

  updateEmployee(empId: string, updateEmployeeRequest: Employee): Observable<Employee> {
    // Ensure the full EmpId is sent, including the 'Emp' prefix
    return this.http.put<Employee>(this.baseApiUrl + '/api/employees/' + empId, updateEmployeeRequest);
  }

  deleteEmployee(empId: string): Observable<Employee> {
    // Ensure the full EmpId is sent, including the 'Emp' prefix
    return this.http.delete<Employee>(this.baseApiUrl + '/api/employees/' + empId);
  }

  getEmployeesCount(): Observable<number> {
    return this.http.get<number>(this.baseApiUrl + '/api/employees/count');
  }

  getEmployeeByEmail(email: string): Observable<Employee> {
    return this.http.get<Employee>(this.baseApiUrl + '/api/employees/email/' + email);
  }
}
