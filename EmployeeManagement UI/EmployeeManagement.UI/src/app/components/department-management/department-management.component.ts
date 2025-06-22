import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentsService, Department } from 'src/app/services/departments.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { Employee } from 'src/app/models/employee.model';

@Component({
  selector: 'app-department-management',
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.css']
})
export class DepartmentManagementComponent implements OnInit {

  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  employees: Employee[] = [];
  departmentForm!: FormGroup;
  isEditMode: boolean = false;
  selectedDepartmentId: string | null = null;
  showAddForm: boolean = false;
  searchTerm: string = '';
  filter = { status: 'all' };
  selectedDepartments: string[] = [];
  toasts: { type: 'success' | 'error', message: string, header?: string }[] = [];
  showHeadsModal = false;
  departmentHeadsList: { name: string; avatar: string | null; email?: string; departments: string[] }[] = [];

  constructor(
    private fb: FormBuilder,
    private departmentsService: DepartmentsService,
    private employeesService: EmployeesService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getAllDepartments();
    this.getAllEmployees();
  }

  initForm(): void {
    this.departmentForm = this.fb.group({
      departmentName: ['', Validators.required],
      head: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.cancelEdit();
    } else {
      this.departmentForm.reset();
      this.isEditMode = false;
      this.selectedDepartmentId = null;
    }
  }

  getAllDepartments(): void {
    this.departmentsService.getAllDepartments()
      .subscribe({
        next: (departments) => {
          this.departments = departments.map(dep => {
            const headEmployee = this.employees.find(emp => `${emp.firstName} ${emp.lastName}` === dep.head);
            let avatarUrl = '';
            if (headEmployee) {
              avatarUrl = this.getEmployeeAvatar(headEmployee);
            } else {
              avatarUrl = 'https://randomuser.me/api/portraits/men/0.jpg';
            }
            return {
              ...dep,
              headAvatar: avatarUrl,
              headEmail: headEmployee?.emailId || ''
            };
          });
          this.computeDepartmentHeadsList();
          this.applyFilters();
        },
        error: (err: any) => {
          this.showToast('error', 'Failed to load departments.');
        }
      });
  }

  getAllEmployees(): void {
    this.employeesService.getAllEmployees()
      .subscribe({
        next: (employees) => {
          this.employees = employees;
        },
        error: (err: any) => {
          this.showToast('error', 'Failed to load employees.');
        }
      });
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      if (this.isEditMode && this.selectedDepartmentId) {
        this.updateDepartment();
      } else {
        this.addDepartment();
      }
    } else {
      this.departmentForm.markAllAsTouched();
    }
  }

  addDepartment(): void {
    const newDepartment: Omit<Department, 'id' | 'totalEmployees'> = {
      departmentName: this.departmentForm.value.departmentName,
      head: this.departmentForm.value.head,
      status: this.departmentForm.value.status
    };

    this.departmentsService.addDepartment(newDepartment as Department)
      .subscribe({
        next: (res: any) => {
          this.showToast('success', 'Department added successfully!');
          this.departmentForm.reset();
          this.getAllDepartments();
          this.showAddForm = false;
        },
        error: (err: any) => {
          this.showToast('error', 'Failed to add department.');
        }
      });
  }

  editDepartment(department: Department): void {
    this.isEditMode = true;
    this.selectedDepartmentId = department.id;
    this.departmentForm.patchValue({
      departmentName: department.departmentName,
      head: department.head,
      status: department.status
    });
    this.showAddForm = true;
  }

  updateDepartment(): void {
    if (this.selectedDepartmentId) {
      const updatedDepartment: Department = {
        id: this.selectedDepartmentId,
        departmentName: this.departmentForm.value.departmentName,
        head: this.departmentForm.value.head,
        totalEmployees: 0,
        status: this.departmentForm.value.status
      };

      this.departmentsService.updateDepartment(this.selectedDepartmentId, updatedDepartment)
        .subscribe({
          next: (res: any) => {
            this.showToast('success', 'Department updated successfully!');
            this.cancelEdit();
            this.getAllDepartments();
            this.showAddForm = false;
          },
          error: (err: any) => {
            this.showToast('error', 'Failed to update department.');
          }
        });
    }
  }

  deleteDepartment(id: string): void {
    if (confirm('Are you sure you want to delete this department?')) {
      this.departmentsService.deleteDepartment(id)
        .subscribe({
          next: (res: any) => {
            this.showToast('success', 'Department deleted successfully!');
            this.getAllDepartments();
          },
          error: (err: any) => {
            this.showToast('error', 'Failed to delete department.');
          }
        });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedDepartmentId = null;
    this.departmentForm.reset();
    this.showAddForm = false;
  }

  // --- Enhancements ---
  applyFilters(): void {
    this.filteredDepartments = this.departments.filter(dep => {
      const matchesSearch = this.searchTerm.trim() === '' ||
        dep.departmentName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        dep.head.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.filter.status === 'all' || dep.status === this.filter.status;
      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filter.status = 'all';
    this.applyFilters();
  }

  toggleDepartmentSelection(id: string): void {
    const idx = this.selectedDepartments.indexOf(id);
    if (idx > -1) {
      this.selectedDepartments.splice(idx, 1);
    } else {
      this.selectedDepartments.push(id);
    }
  }

  bulkDelete(): void {
    if (this.selectedDepartments.length === 0) return;
    if (!confirm('Are you sure you want to delete the selected departments?')) return;
    let deletedCount = 0;
    this.selectedDepartments.forEach(id => {
      this.departmentsService.deleteDepartment(id).subscribe({
        next: () => {
          deletedCount++;
          if (deletedCount === this.selectedDepartments.length) {
            this.getAllDepartments();
            this.selectedDepartments = [];
            this.showToast('success', 'Selected departments deleted successfully');
          }
        },
        error: () => {
          this.showToast('error', `Failed to delete department ${id}`);
        }
      });
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  showToast(type: 'success' | 'error', message: string, header?: string) {
    const toast = { type, message, header };
    this.toasts.push(toast);
    setTimeout(() => this.removeToast(toast), 3500);
  }

  removeToast(toast: any) {
    const idx = this.toasts.indexOf(toast);
    if (idx > -1) this.toasts.splice(idx, 1);
  }

  computeDepartmentHeadsList(): void {
    const headsMap: { [name: string]: { name: string; avatar: string | null; email?: string; departments: string[] } } = {};
    for (const dep of this.departments) {
      if (!dep.head) continue;
      if (!headsMap[dep.head]) {
        headsMap[dep.head] = {
          name: dep.head,
          avatar: dep.headAvatar || null,
          email: dep.headEmail || '',
          departments: []
        };
      }
      headsMap[dep.head].departments.push(dep.departmentName);
    }
    this.departmentHeadsList = Object.values(headsMap);
  }

  /**
   * Returns a number between 0-99 for avatar assignment, based on a string hash
   */
  getAvatarNumber(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Returns the avatar URL for an employee: uploaded photo if available and unique, otherwise realistic gendered avatar
   */
  getEmployeeAvatar(employee: Employee): string {
    const defaultPhotos = [
      '/assets/default-avatar.png',
      'default-avatar.png',
      'https://randomuser.me/api/portraits/men/0.jpg',
      'https://randomuser.me/api/portraits/women/0.jpg',
      '',
      null,
      undefined
    ];
    if (employee.photo && !defaultPhotos.includes(employee.photo)) {
      const isUnique = this.employees.filter(e => e.photo === employee.photo).length === 1;
      if (isUnique) return employee.photo;
    }
    const gender = employee.gender === 'female' ? 'women' : 'men';
    const hash = this.getAvatarNumber(employee.empId || employee.emailId || employee.firstName + employee.lastName);
    return `https://randomuser.me/api/portraits/${gender}/${hash}.jpg`;
  }
}
