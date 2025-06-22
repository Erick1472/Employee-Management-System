import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  id: string;
  departmentName: string;
  head: string;
  totalEmployees: number;
  status: string;
  headAvatar?: string | null;
  headEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentsService {

  baseApiUrl: string = 'https://localhost:7035';

  constructor(private http: HttpClient) { }

  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.baseApiUrl + '/api/Department');
  }

  addDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(this.baseApiUrl + '/api/Department', department);
  }

  getDepartment(id: string): Observable<Department> {
    return this.http.get<Department>(this.baseApiUrl + '/api/Department/' + id);
  }

  updateDepartment(id: string, updateDepartmentRequest: Department): Observable<Department> {
    return this.http.put<Department>(this.baseApiUrl + '/api/Department/' + id, updateDepartmentRequest);
  }

  deleteDepartment(id: string): Observable<Department> {
    return this.http.delete<Department>(this.baseApiUrl + '/api/Department/' + id);
  }

  getTotalDepartmentsCount(): Observable<number> {
    return this.http.get<number>(this.baseApiUrl + '/api/Department/count');
  }

  getDepartmentHeadsCount(): Observable<number> {
    return this.http.get<number>(this.baseApiUrl + '/api/Department/heads-count');
  }
}
