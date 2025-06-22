import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

interface LoginResponse {
  token: string;
  user: {
    email: string;
    role: string;
    name?: string;
    avatar?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
// Service for handling user authentication
export class AuthService {
  private apiUrl = 'https://localhost:7035/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      this.currentUserSubject.next(JSON.parse(userString));
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`https://localhost:7035/api/auth/login`, { email, password })
      .pipe(
        map((response: LoginResponse) => {
          if (!response || !response.token || !response.user) {
            throw new Error('Invalid response from server');
          }
          
          localStorage.clear();

          const user: User = {
            email: response.user.email,
            token: response.token,
            role: (response.user.role || '').trim(),
            name: response.user.name || response.user.email,
            avatar: response.user.avatar || 'assets/default-avatar.png'
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          return user;
        })
      );
  }

  logout() {
    // Remove user from local storage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getToken(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.token : null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role?.toLowerCase() === 'admin';
  }

  getRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }
} 