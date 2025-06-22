import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loading = false;
  error = '';
  selectedRole = 'employee'; // Default role
  passwordVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  onLogin() {
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        
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
        this.toastr.error(error.error?.message || error.message || 'Login failed. Please check credentials.', 'Login Error');
      }
    });
  }

  private redirectBasedOnRole() {
    const role = this.authService.getRole();
    if (role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    } else if (role === 'employee') {
      this.router.navigate(['/employee-dashboard']);
    } else {
      this.error = 'Unknown user role. Please contact support.';
      this.toastr.error(this.error, 'Login Error');
      this.authService.logout();
    }
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  goToHomepage() {
    this.router.navigate(['/']);
  }
} 