import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeesService } from 'src/app/services/employees.service';
import { DepartmentsService, Department } from 'src/app/services/departments.service';
import { Employee } from 'src/app/models/employee.model';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit {
  addEmployeeForm!: FormGroup;
  showAddForm: boolean = false;
  departments: Department[] = [];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeesService,
    private router: Router,
    private departmentsService: DepartmentsService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();
  }

  initForm(): void {
    this.addEmployeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      department: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  };

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

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.addEmployeeForm.reset();
    }
  }

  onSubmit(): void {
    console.log('=== EMPLOYEE ADDITION DEBUG ===');
    console.log('Form submitted');
    console.log('Form valid:', this.addEmployeeForm.valid);
    console.log('Form values:', this.addEmployeeForm.value);
    console.log('Form errors:', this.addEmployeeForm.errors);
    
    if (this.addEmployeeForm.valid) {
      const formValue = this.addEmployeeForm.value;
      const employeeData: Omit<Employee, 'empId' | 'id'> = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        department: formValue.department,
        emailId: formValue.emailId,
        mobileNo: formValue.mobileNo,
        dateOfJoining: formValue.dateOfJoining,
        password: formValue.password,
      };

      console.log('Sending employee data:', employeeData);
      console.log('Data type:', typeof employeeData);
      console.log('JSON stringified:', JSON.stringify(employeeData));

      this.employeeService.addEmployee(employeeData)
        .subscribe({
          next: (employee) => {
            console.log('Employee added successfully:', employee);
            alert('Employee added successfully!');
            this.addEmployeeForm.reset();
            this.router.navigate(['/admin-dashboard'], { queryParams: { section: 'employee' } });
          },
          error: (error) => {
            console.error('=== ERROR DETAILS ===');
            console.error('Error object:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error error:', error.error);
            console.error('Full error response:', error);
            
            let errorMessage = 'Unknown error occurred';
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            } else if (error.error) {
              errorMessage = JSON.stringify(error.error);
            }
            
            alert('Error adding employee: ' + errorMessage);
          }
        });
    } else {
      console.log('Form is invalid');
      console.log('Form validation errors:', this.addEmployeeForm.errors);
      this.addEmployeeForm.markAllAsTouched();
    }
  }
}
