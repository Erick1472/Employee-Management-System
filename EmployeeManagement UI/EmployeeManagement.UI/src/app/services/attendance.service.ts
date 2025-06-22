import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Attendance {
  id?: string;
  employeeId: string;
  date: string;
  isPresent: boolean;
  isLate: boolean;
  checkInTime?: string;
  markedByAdminId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  baseApiUrl: string = 'https://localhost:7035';

  constructor(private http: HttpClient) { }

  getAttendanceByEmployeeId(empId: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseApiUrl}/api/Attendance/employee/${empId}`);
  }

  getTodayAttendance(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseApiUrl}/api/Attendance/today`);
  }

  getAttendanceByDate(date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseApiUrl}/api/Attendance/date/${date}`);
  }

  markAttendance(attendance: Attendance): Observable<any> {
    console.log('Sending attendance to backend:', attendance);
    return this.http.post(`${this.baseApiUrl}/api/Attendance/mark`, attendance).pipe(
      tap(res => console.log('Attendance API response:', res)),
      catchError(err => {
        console.error('Attendance API error:', err);
        return throwError(() => err);
      })
    );
  }

  editAttendance(id: string, attendance: Attendance): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.baseApiUrl}/api/Attendance/${id}`, attendance);
  }
} 