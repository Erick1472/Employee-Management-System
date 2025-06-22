import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onLogin() {
    localStorage.clear();
    this.loading = true;

    // --- Start of pre-flight logging ---
    console.log('onLogin() method triggered. Creating login observable...');
    // --- End of pre-flight logging ---

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        
        console.log('Login successful, received user object:', user);
        if (user && user.role) {
          console.log('Value of user.role:', `'${user.role}'`);
          console.log('Type of user.role:', typeof user.role);
          console.log("Is role === 'admin'?", user.role === 'admin');
          console.log("Is role === 'employee'?", user.role === 'employee');
        } else {
          console.log('User object or user.role is missing.');
        }

        if (user.role === 'admin') {
          this.toastr.success('Admin login successful!');
          this.router.navigate(['/admin-dashboard']);
        } else if (user.role === 'employee') {
          this.toastr.success('Employee login successful!');
          this.router.navigate(['/employee-dashboard']);
        } else {
          this.toastr.error('Role not recognized. Please contact support.', 'Authorization Error');
          this.authService.logout();
        }
      },
      error: (error) => {
        this.loading = false;
        // --- Start of extensive logging ---
        console.error('An error occurred during login:', error);
        // --- End of extensive logging ---
        this.toastr.error(error.error?.message || error.message || 'Login failed. Please check credentials.', 'Login Error');
      }
    });
  }
} 