import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model'; // Assuming Employee model path
import { LeaveType } from './leave-types.service'; // Assuming LeaveType interface path

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee; // Make employee optional
  leaveTypeId: string;
  leaveType?: LeaveType; // Navigation property from backend
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestsService {

  baseApiUrl: string = 'https://localhost:7035';

  constructor(private http: HttpClient) { }

  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(this.baseApiUrl + '/api/LeaveRequest');
  }

  addLeaveRequest(addLeaveRequest: Omit<LeaveRequest, 'id' | 'employee' | 'leaveType' | 'status'>): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.baseApiUrl + '/api/LeaveRequest', addLeaveRequest);
  }

  getLeaveRequest(id: string): Observable<LeaveRequest> {
    return this.http.get<LeaveRequest>(this.baseApiUrl + '/api/LeaveRequest/' + id);
  }

  updateLeaveRequest(id: string, updateLeaveRequest: Omit<LeaveRequest, 'employee' | 'leaveType'>): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(this.baseApiUrl + '/api/LeaveRequest/' + id, updateLeaveRequest);
  }

  deleteLeaveRequest(id: string): Observable<LeaveRequest> {
    return this.http.delete<LeaveRequest>(this.baseApiUrl + '/api/LeaveRequest/' + id);
  }

  // Methods for status updates
  approveLeaveRequest(id: string): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(this.baseApiUrl + '/api/LeaveRequest/' + id, { status: 'Approved' });
  }

  rejectLeaveRequest(id: string): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(this.baseApiUrl + '/api/LeaveRequest/' + id, { status: 'Rejected' });
  }

  getTotalLeaveRequestsCount(): Observable<number> {
    return this.http.get<number>(this.baseApiUrl + '/api/LeaveRequest/count');
  }

  getNewLeaveRequestsCount(): Observable<number> {
    return this.http.get<number>(this.baseApiUrl + '/api/LeaveRequest/new-count');
  }

  getPendingLeaveRequestsCount(): Observable<number> {
    return this.http.get<number>(this.baseApiUrl + '/api/LeaveRequest/pending-count');
  }

  getLeaveRequestsByEmployeeId(empId: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.baseApiUrl}/api/LeaveRequest/employee/${empId}`);
  }

}
