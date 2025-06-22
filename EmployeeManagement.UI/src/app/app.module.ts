import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmployeesListComponent } from './components/employees/employees-list/employees-list.component';
import { HomeComponent } from './components/home/home/home.component';
import { AddEmployeeComponent } from './components/employees/add-employee/add-employee.component';
import { EditEmployeeComponent } from './components/employees/edit-employee/edit-employee.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { DepartmentManagementComponent } from './components/department-management/department-management.component';
import { LeaveTypeManagementComponent } from './components/leave-type-management/leave-type-management.component';
import { SalaryManagementComponent } from './components/salary-management/salary-management.component';
import { LeaveRequestManagementComponent } from './components/leave-request-management/leave-request-management.component';
import { TaskManagementComponent } from './components/task-management/task-management.component';
import { NewMessageComponent } from './components/new-message/new-message.component';
import { NewAnnouncementComponent } from './components/new-announcement/new-announcement.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    AppComponent,
    EmployeesListComponent,
    HomeComponent,
    AddEmployeeComponent,
    EditEmployeeComponent,
    LandingPageComponent,
    LoginComponent,
    EmployeeDashboardComponent,
    AdminDashboardComponent,
    DepartmentManagementComponent,
    LeaveTypeManagementComponent,
    SalaryManagementComponent,
    LeaveRequestManagementComponent,
    TaskManagementComponent,
    NewMessageComponent,
    NewAnnouncementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      timeOut: 3000
    }),
    LottieModule.forRoot({ player: playerFactory })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 