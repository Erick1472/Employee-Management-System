import { EmployeesService } from './../../../services/employees.service';
import { Component, OnInit } from '@angular/core';
import { Employee } from 'src/app/models/employee.model';
import { Router } from '@angular/router';
import { DepartmentsService } from 'src/app/services/departments.service';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.css']
})
export class EmployeesListComponent implements OnInit {

  employees: Employee[] = [];
  filteredEmployees: any[] = [];
  isLoading = false;
  searchTerm: string = '';
  filter = { department: 'all' };
  departments: string[] = [];
  selectedEmployees: string[] = [];
  selectedProfile: any = null;
  showProfileModal = false;
  toasts: { type: 'success' | 'error', message: string, header?: string }[] = [];
  showPromoteModal = false;
  promoteData: { empId: string; position: string; headDepartment: string } = { empId: '', position: 'Staff', headDepartment: '' };
  isPromoting = false;
  
  constructor(
    private employeesService: EmployeesService,
    private router: Router,
    private departmentsService: DepartmentsService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeesService.getAllEmployees()
      .subscribe({
        next: (employees) => {
          // Map employees to add UI fields if missing
          this.employees = employees.map(emp => ({
            ...emp,
            phone: emp.mobileNo || '-',
            position: emp.position || '-',
            status: emp.status || 'Active',
            dateJoined: emp.dateOfJoining || emp.dateOfJoining || null,
            bio: emp.bio || ''
          }));
          this.departments = Array.from(new Set(this.employees.map(e => e.department)));
          this.applyFilters();
          this.isLoading = false;
        },
        error: (response) => {
          this.showToast('error', 'Failed to load employees');
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch = this.searchTerm.trim() === '' ||
        emp.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.emailId.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDept = this.filter.department === 'all' || emp.department === this.filter.department;
      return matchesSearch && matchesDept;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filter.department = 'all';
    this.applyFilters();
  }

  toggleEmployeeSelection(empId: string): void {
    const idx = this.selectedEmployees.indexOf(empId);
    if (idx > -1) {
      this.selectedEmployees.splice(idx, 1);
    } else {
      this.selectedEmployees.push(empId);
    }
  }

  openProfileModal(employee: any): void {
    this.selectedProfile = employee;
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedProfile = null;
  }

  bulkDelete(): void {
    if (this.selectedEmployees.length === 0) return;
    if (!confirm('Are you sure you want to delete the selected employees?')) return;
    let deletedCount = 0;
    this.selectedEmployees.forEach(empId => {
      this.employeesService.deleteEmployee(empId).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => emp.empId !== empId);
          deletedCount++;
          if (deletedCount === this.selectedEmployees.length) {
            this.applyFilters();
            this.selectedEmployees = [];
            this.showToast('success', 'Selected employees deleted successfully');
          }
        },
        error: () => {
          this.showToast('error', `Failed to delete employee ${empId}`);
        }
      });
    });
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

  editEmployee(empId: string | undefined): void {
    if (!empId) {
      this.showToast('error', 'Cannot edit employee: empId is undefined');
      return;
    }
    this.router.navigate(['/employees/edit', empId]);
  }

  deleteEmployee(empId: string | undefined): void {
    if (!empId) {
      this.showToast('error', 'Cannot delete employee: empId is undefined');
      return;
    }
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeesService.deleteEmployee(empId)
        .subscribe({
          next: () => {
            this.employees = this.employees.filter(emp => emp.empId !== empId);
            this.applyFilters();
            this.showToast('success', 'Employee deleted successfully');
          },
          error: (response) => {
            this.showToast('error', 'Error deleting employee');
          }
        });
    }
  }

  /**
   * Returns the avatar URL for an employee: uploaded photo if available and unique, otherwise realistic gendered avatar
   */
  getEmployeeAvatar(employee: Employee): string {
    // List of known default/placeholder images
    const defaultPhotos = [
      '/assets/default-avatar.png',
      'default-avatar.png',
      'https://randomuser.me/api/portraits/men/0.jpg',
      'https://randomuser.me/api/portraits/women/0.jpg',
      '',
      null,
      undefined
    ];
    // If photo is set and not a default/placeholder, use it
    if (employee.photo && !defaultPhotos.includes(employee.photo)) {
      // Also check if this photo is unique among all employees
      const isUnique = this.employees.filter(e => e.photo === employee.photo).length === 1;
      if (isUnique) return employee.photo;
    }
    // Otherwise, use fallback
    const gender = employee.gender === 'female' ? 'women' : 'men';
    const hash = this.getAvatarNumber(employee.empId || employee.emailId || employee.firstName + employee.lastName);
    return `https://randomuser.me/api/portraits/${gender}/${hash}.jpg`;
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

  openPromoteModal(employee: Employee): void {
    this.promoteData = {
      empId: employee.empId || '',
      position: employee.position || 'Staff',
      headDepartment: ''
    };
    this.showPromoteModal = true;
  }

  closePromoteModal(): void {
    this.showPromoteModal = false;
    this.promoteData = { empId: '', position: 'Staff', headDepartment: '' };
  }

  async savePromotion(): Promise<void> {
    if (!this.promoteData.empId) {
      this.showToast('error', 'No employee selected for promotion.');
      return;
    }
    this.isPromoting = true;
    try {
      // Find the full employee object
      const emp = this.employees.find(e => e.empId === this.promoteData.empId);
      if (!emp) throw new Error('Employee not found');
      // Create a valid Employee object with updated position
      const updatedEmp: Employee = { ...emp, position: this.promoteData.position };
      await this.employeesService.updateEmployee(updatedEmp.empId, updatedEmp).toPromise();
      // Assign as head of department if selected
      if (this.promoteData.headDepartment) {
        const departments = await this.departmentsService.getAllDepartments().toPromise();
        if (!departments) throw new Error('Departments not found');
        const dept = departments.find((d: any) => d.departmentName === this.promoteData.headDepartment);
        if (!dept) throw new Error('Department not found');
        const updatedDept = { ...dept, head: this.getEmployeeFullName(this.promoteData.empId) };
        await this.departmentsService.updateDepartment(dept.id, updatedDept).toPromise();
        this.showToast('success', 'Promotion and head assignment successful!');
      } else {
        this.showToast('success', 'Promotion successful!');
      }
      // Refresh employees list
      this.loadEmployees();
      this.closePromoteModal();
    } catch (err: any) {
      this.showToast('error', err.message || 'Error during promotion.');
      this.isPromoting = false;
    }
    this.isPromoting = false;
  }

  getEmployeeFullName(empId: string): string {
    const emp = this.employees.find(e => e.empId === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : '';
  }
}
