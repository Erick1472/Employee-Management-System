import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  baseApiUrl: string = 'https://localhost:7035'; // Updated to match backend URL

  constructor(private http: HttpClient) { }
} 