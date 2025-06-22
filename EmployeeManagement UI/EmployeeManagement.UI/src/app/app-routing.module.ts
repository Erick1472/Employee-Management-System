import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEmployeeComponent } from './components/employees/add-employee/add-employee.component';
import { EditEmployeeComponent } from './components/employees/edit-employee/edit-employee.component';
import { EmployeesListComponent } from './components/employees/employees-list/employees-list.component';
import { HomeComponent } from './components/home/home/home.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  {
    path: '', // Default path to landing page
    component: LandingPageComponent,
  },
  {
    path: 'home', // Admin Dashboard
    component: HomeComponent, 
  },
  {
    path: 'login', // Login Page
    component: LoginComponent,
  },
  {
    path: 'admin-dashboard', // Admin Dashboard
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'employee-dashboard', // Employee Dashboard
    component: EmployeeDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'employees', // If employee selected. 
    component: EmployeesListComponent
  },
  {
    path: 'home/employees',
    component: EmployeesListComponent
  },
  {
    path: 'employees/add',
    component: AddEmployeeComponent
  },
  {
    path: 'employees/edit/:id',
    component: EditEmployeeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
