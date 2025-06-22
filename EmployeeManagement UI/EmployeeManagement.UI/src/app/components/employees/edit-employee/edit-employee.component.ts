import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService } from 'src/app/services/employees.service';
import { Employee } from 'src/app/models/employee.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DepartmentsService, Department } from 'src/app/services/departments.service';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.css']
})
export class EditEmployeeComponent implements OnInit {

  employeeDetails: Employee | undefined;
  editEmployeeForm!: FormGroup;
  departments: Department[] = [];

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeesService,
    private router: Router,
    private fb: FormBuilder,
    private departmentsService: DepartmentsService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();

    this.route.paramMap.subscribe({
      next: (params) => {
        const empId = params.get('id');
        if (empId) {
          this.employeeService.getEmployee(empId)
            .subscribe({
              next: (response: Employee) => {
                this.employeeDetails = response;
                this.editEmployeeForm.patchValue({
                  empId: this.employeeDetails.empId,
                  firstName: this.employeeDetails.firstName,
                  lastName: this.employeeDetails.lastName,
                  emailId: this.employeeDetails.emailId,
                  mobileNo: this.employeeDetails.mobileNo,
                  department: this.employeeDetails.department,
                  dateOfJoining: this.formatDate(this.employeeDetails.dateOfJoining),
                });
              },
              error: (err: any) => {
                console.error(err);
                alert("Error fetching employee details");
              }
            });
        }
      }
    });
  }

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Handle invalid date
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  loadDepartments(): void {
    this.departmentsService.getAllDepartments()
      .subscribe({
        next: (departments) => {
          this.departments = departments;
          console.log('Loaded departments:', this.departments);
        },
        error: (error) => {
          console.error('Error loading departments:', error);
          alert('Failed to load departments. Please try again.');
        }
      });
  }

  updateEmployee(): void {
    if (this.editEmployeeForm.valid && this.employeeDetails) {
      if (!this.employeeDetails.empId) {
        alert('Employee ID is missing, cannot update.');
        return;
      }

      const formValue = this.editEmployeeForm.value;

      // Always send all required fields, never null or empty string
      const updatedEmployee: Employee = {
        empId: this.employeeDetails.empId,
        firstName: formValue.firstName || this.employeeDetails.firstName,
        lastName: formValue.lastName || this.employeeDetails.lastName,
        emailId: formValue.emailId || this.employeeDetails.emailId,
        mobileNo: formValue.mobileNo || this.employeeDetails.mobileNo,
        department: formValue.department?.trim() || this.employeeDetails.department,
        dateOfJoining: formValue.dateOfJoining
          ? new Date(formValue.dateOfJoining).toISOString()
          : this.employeeDetails.dateOfJoining,
        password: formValue.password
          ? formValue.password
          : this.employeeDetails.password || '', // Never send null
      };

      this.employeeService.updateEmployee(this.employeeDetails.empId, updatedEmployee)
        .subscribe({
          next: (response: any) => {
            alert('Employee updated successfully!');
            this.router.navigate(['admin-dashboard']);
          },
          error: (err: any) => {
            console.error('Update error:', err, 'Payload:', updatedEmployee);
            alert('Error updating employee.');
          }
        });
    } else {
      this.editEmployeeForm.markAllAsTouched();
    }
  }

  deleteEmployee(): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      if (this.employeeDetails) {
        if (!this.employeeDetails.empId) {
          alert('Employee ID is missing, cannot delete.');
          return;
        }
        this.employeeService.deleteEmployee(this.employeeDetails.empId!)
          .subscribe({
            next: (response: any) => {
              alert('Employee deleted successfully!');
              this.router.navigate(['admin-dashboard']);
            },
            error: (err: any) => {
              console.error(err);
              alert('Error deleting employee.');
            }
          });
      }
    }
  }

  initForm(): void {
    this.editEmployeeForm = this.fb.group({
      empId: [''], // EmpId is usually not editable by user, but required for update API
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      department: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      password: [''],  // Made optional for general edit, handle separately for password change
      confirmPassword: [''] // Made optional, if password is not being explicitly changed
    });
    // Removed passwordMatchValidator from here, as password is not required for general edit
  }
} 