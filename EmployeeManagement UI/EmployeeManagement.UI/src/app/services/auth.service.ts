import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface User {
  email: string;
  token: string;
  role: string;
  name: string;
  avatar: string;
}

interface LoginResponse {
  token: string;
  user: {
    email: string;
    role: string;
    name?: string;
    avatar?: string;
  };
}

function decodeJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7035/api/auth'; // Updated to use HTTPS
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const userString = localStorage.getItem('currentUser');
    let user: User | null = null;
    if (userString) {
      const storedUser = JSON.parse(userString);
      if (this.isTokenExpired(storedUser.token)) {
        localStorage.removeItem('currentUser');
      } else {
        user = storedUser;
      }
    }
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  private isTokenExpired(token: string): boolean {
    const payload = decodeJwt(token);
    if (payload && payload.exp) {
      return (payload.exp * 1000 < Date.now());
    }
    return true; // If no expiry, treat as expired/invalid
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

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const user = this.currentUserSubject.value;
    if (user && user.token && !this.isTokenExpired(user.token)) {
      return true;
    }
      return false;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role.toLowerCase() === 'admin';
  }

  getRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  updateCurrentUser(user: User): void {
    console.log('AuthService: Updating current user with avatar:', user.avatar);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    console.log('AuthService: Current user updated successfully');
  }
} 