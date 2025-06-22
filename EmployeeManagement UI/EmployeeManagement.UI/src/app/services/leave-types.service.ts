import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaveType {
  id: string;
  name: string;
  maxDays: number;
  description: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveTypesService {

  baseApiUrl: string = 'https://localhost:7035';

  constructor(private http: HttpClient) { }

  getAllLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(this.baseApiUrl + '/api/LeaveType');
  }

  addLeaveType(addLeaveTypeRequest: Omit<LeaveType, 'id'>): Observable<LeaveType> {
    return this.http.post<LeaveType>(this.baseApiUrl + '/api/LeaveType', addLeaveTypeRequest);
  }

  getLeaveType(id: string): Observable<LeaveType> {
    return this.http.get<LeaveType>(this.baseApiUrl + '/api/LeaveType/' + id);
  }

  updateLeaveType(id: string, updateLeaveTypeRequest: LeaveType): Observable<LeaveType> {
    return this.http.put<LeaveType>(this.baseApiUrl + '/api/LeaveType/' + id, updateLeaveTypeRequest);
  }

  deleteLeaveType(id: string): Observable<LeaveType> {
    return this.http.delete<LeaveType>(this.baseApiUrl + '/api/LeaveType/' + id);
  }

  getTotalLeaveTypesCount(): Observable<number> {
    return this.http.get<number>(this.baseApiUrl + '/api/LeaveType/count');
  }

  getActiveLeaveTypesCount(): Observable<number> {
    return this.http.get<number>(this.baseApiUrl + '/api/LeaveType/active-count');
  }

  getLeaveTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.baseApiUrl + '/api/leaveRequest/leave-types');
  }

  getLeaveTypesForRequests(): Observable<any[]> {
    return this.http.get<any[]>(this.baseApiUrl + '/api/leaveRequest/leave-types');
  }
} 