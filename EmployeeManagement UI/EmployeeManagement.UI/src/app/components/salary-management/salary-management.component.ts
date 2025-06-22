import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalariesService, Salary } from 'src/app/services/salaries.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { Employee } from 'src/app/models/employee.model';

@Component({
  selector: 'app-salary-management',
  templateUrl: './salary-management.component.html',
  styleUrls: ['./salary-management.component.css']
})
export class SalaryManagementComponent implements OnInit {

  salaryRecords: Salary[] = [];
  filteredSalaries: Salary[] = [];
  employees: Employee[] = [];
  salaryForm!: FormGroup;
  isEditMode: boolean = false;
  selectedSalaryRecordId: string | null = null;
  showAddForm: boolean = false;

  // Filtering and searching
  selectedEmployeeFilter: string = '';
  searchText: string = '';

  // New properties for modal and filtering
  showModal: boolean = false;
  filter = { employeeId: '' };
  searchTerm: string = '';

  constructor(
    private fb: FormBuilder,
    private salariesService: SalariesService,
    private employeesService: EmployeesService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getAllEmployees();
  }

  initForm(): void {
    this.salaryForm = this.fb.group({
      id: [null],
      employeeId: [null, Validators.required],
      basicSalary: [null, [Validators.required, Validators.min(0)]],
      allowances: [0, Validators.min(0)],
      deductions: [0, Validators.min(0)],
      month: ['', Validators.required],
      paymentDate: ['', Validators.required]
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.cancelEdit();
    } else {
      this.salaryForm.reset();
      this.isEditMode = false;
      this.selectedSalaryRecordId = null;
    }
  }

  openSalaryModal(record: Salary | null = null): void {
    if (record) {
      this.isEditMode = true;
      this.salaryForm.patchValue({
        id: record.id,
        employeeId: record.employeeId,
        basicSalary: record.basicSalary,
        allowances: record.allowances,
        deductions: record.deductions,
        month: record.month,
        paymentDate: this.formatDate(record.paymentDate)
      });
    } else {
      this.isEditMode = false;
      this.salaryForm.reset();
    }
    this.showModal = true;
  }

  closeSalaryModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.salaryForm.reset();
  }

  getAllEmployees(): void {
    this.employeesService.getAllEmployees()
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          this.getAllSalaryRecords();
        },
        error: (err: any) => {
          console.error('Error fetching employees:', err);
          alert('Failed to load employees.');
        }
      });
  }

  getAllSalaryRecords(): void {
    this.salariesService.getAllSalaryRecords()
      .subscribe({
        next: (records) => {
          this.salaryRecords = records.map(record => ({
            ...record,
            employee: this.employees.find(emp => emp.empId === record.employeeId)
          }));
          this.applyFilters();
        },
        error: (err: any) => {
          console.error('Error fetching salary records:', err);
          alert('Failed to load salary records.');
        }
      });
  }

  onSubmit(): void {
    if (this.salaryForm.valid) {
      const formData = this.salaryForm.value;
      if (this.isEditMode) {
        this.salariesService.updateSalaryRecord(formData.id, formData).subscribe({
          next: () => {
            this.getAllSalaryRecords();
            this.closeSalaryModal();
          },
          error: (err) => console.error('Failed to update salary', err)
        });
      } else {
        this.salariesService.addSalaryRecord(formData).subscribe({
          next: () => {
            this.getAllSalaryRecords();
            this.closeSalaryModal();
          },
          error: (err) => console.error('Failed to add salary', err)
        });
      }
    } else {
      this.salaryForm.markAllAsTouched();
    }
  }

  deleteSalary(id: string): void {
    if (confirm('Are you sure you want to delete this salary record?')) {
      this.salariesService.deleteSalaryRecord(id).subscribe({
        next: () => {
            this.getAllSalaryRecords();
          },
        error: (err) => console.error('Failed to delete salary', err)
        });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedSalaryRecordId = null;
    this.salaryForm.reset();
    this.showAddForm = false;
  }

  private formatDate(date: any): string {
    if (!date) return '';
    try {
    const d = new Date(date);
      // Adjust for timezone offset
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    const year = d.getFullYear();
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const day = ('0' + d.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Invalid date for formatting:', date);
      return '';
    }
  }

  applyFilters(): void {
    let filtered = [...this.salaryRecords];

    if (this.filter.employeeId) {
      filtered = filtered.filter(record => record.employeeId === this.filter.employeeId);
    }
    
    if (this.searchTerm) {
        const lowercasedFilter = this.searchTerm.toLowerCase();
        filtered = filtered.filter(record => {
            const employee = this.employees.find(e => e.empId === record.employeeId);
            return (
                employee?.firstName.toLowerCase().includes(lowercasedFilter) ||
                employee?.lastName.toLowerCase().includes(lowercasedFilter) ||
                employee?.empId.toLowerCase().includes(lowercasedFilter) ||
                employee?.department.toLowerCase().includes(lowercasedFilter)
            );
        });
    }

    this.filteredSalaries = filtered;
  }
  
  getEmployeeName(empId: string): string {
    const employee = this.employees.find(e => e.empId === empId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  }

  getEmployeeDepartment(empId: string): string {
    const employee = this.employees.find(e => e.empId === empId);
    return employee ? employee.department : 'N/A';
  }
}
