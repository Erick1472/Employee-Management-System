import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveRequestsService, LeaveRequest } from 'src/app/services/leave-requests.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { LeaveTypesService, LeaveType } from 'src/app/services/leave-types.service';
import { Employee } from 'src/app/models/employee.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-leave-request-management',
  templateUrl: './leave-request-management.component.html',
  styleUrls: ['./leave-request-management.component.css']
})
export class LeaveRequestManagementComponent implements OnInit {

  leaveRequests: LeaveRequest[] = [];
  filteredLeaveRequests: LeaveRequest[] = [];
  employees: Employee[] = [];
  leaveTypes: LeaveType[] = [];
  leaveRequestForm!: FormGroup;
  isEditMode: boolean = false;
  
  // Updated properties for new design
  showModal: boolean = false;
  isAdmin: boolean = false;
  isLoading: boolean = false;
  toasts: { header: string, message: string, type: 'success' | 'error' }[] = [];
  filter = { status: '' };

  constructor(
    private fb: FormBuilder,
    private leaveRequestsService: LeaveRequestsService,
    private employeesService: EmployeesService,
    private leaveTypesService: LeaveTypesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.initForm();
    this.loadInitialData();
  }

  initForm(): void {
    this.leaveRequestForm = this.fb.group({
      id: [null],
      employeeId: ['', Validators.required],
      leaveTypeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required],
      status: ['Pending']
    });
  }

  loadInitialData(): void {
    this.isLoading = true;
    // Using forkJoin or other strategies could be better for parallel calls
    this.employeesService.getAllEmployees().subscribe(employees => {
      this.employees = employees;
      this.leaveTypesService.getAllLeaveTypes().subscribe(leaveTypes => {
        this.leaveTypes = leaveTypes;
        this.leaveRequestsService.getAllLeaveRequests().subscribe(requests => {
          // Manually link employee and leaveType data for immediate use
          this.leaveRequests = requests.map(req => ({
            ...req,
            employee: this.employees.find(e => e.empId === req.employeeId),
            leaveType: this.leaveTypes.find(lt => lt.id === req.leaveTypeId)
          }));
          this.applyFilters();
          this.isLoading = false;
        }, () => this.isLoading = false);
      }, () => this.isLoading = false);
    }, () => this.isLoading = false);
        }

  applyFilters(): void {
    if (this.filter.status === '') {
      this.filteredLeaveRequests = [...this.leaveRequests];
    } else {
      this.filteredLeaveRequests = this.leaveRequests.filter(req => req.status === this.filter.status);
    }
  }

  filterByStatus(status: string): void {
    this.filter.status = status;
    this.applyFilters();
  }

  openLeaveModal(request: LeaveRequest | null = null): void {
    if (request) {
    this.isEditMode = true;
    this.leaveRequestForm.patchValue({
        id: request.id,
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
      startDate: this.formatDate(request.startDate),
      endDate: this.formatDate(request.endDate),
        reason: request.reason,
        status: request.status
    });
    } else {
      this.isEditMode = false;
      this.leaveRequestForm.reset({ status: 'Pending' });
    }
    this.showModal = true;
  }

  closeLeaveModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (!this.leaveRequestForm.valid) {
      this.showToast('Error', 'Please fill all required fields.', 'error');
      return;
    }
      this.isLoading = true;
    const formData = this.leaveRequestForm.value;

    const requestObservable = this.isEditMode 
      ? this.leaveRequestsService.updateLeaveRequest(formData.id, formData)
      : this.leaveRequestsService.addLeaveRequest(formData);

    requestObservable.subscribe({
      next: () => {
        this.showToast('Success', `Leave request ${this.isEditMode ? 'updated' : 'added'} successfully!`, 'success');
        this.closeLeaveModal();
        this.loadInitialData(); // Reload all data
          },
      error: (err) => {
            this.isLoading = false;
        this.showToast('Error', `Failed to ${this.isEditMode ? 'update' : 'add'} leave request.`, 'error');
        console.error(err);
          }
        });
  }

  deleteLeaveRequest(id: string): void {
    if (confirm('Are you sure you want to delete this leave request?')) {
      this.isLoading = true;
      this.leaveRequestsService.deleteLeaveRequest(id).subscribe({
        next: () => {
            this.showToast('Success', 'Leave request deleted successfully!', 'success');
          this.loadInitialData();
          },
        error: (err) => {
            this.isLoading = false;
            this.showToast('Error', 'Failed to delete leave request.', 'error');
          }
        });
    }
  }

  approveLeaveRequest(id: string): void {
      this.isLoading = true;
    this.leaveRequestsService.approveLeaveRequest(id).subscribe({
      next: () => {
              this.showToast('Success', 'Leave request approved!', 'success');
        this.loadInitialData();
            },
      error: (err) => {
              this.isLoading = false;
              this.showToast('Error', 'Failed to approve leave request.', 'error');
            }
          });
  }

  rejectLeaveRequest(id: string): void {
      this.isLoading = true;
    this.leaveRequestsService.rejectLeaveRequest(id).subscribe({
      next: () => {
              this.showToast('Success', 'Leave request rejected!', 'success');
        this.loadInitialData();
            },
      error: (err) => {
              this.isLoading = false;
              this.showToast('Error', 'Failed to reject leave request.', 'error');
            }
          });
      }
  
  getEmployeeName(empId: string): string {
    const employee = this.employees.find(e => e.empId === empId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'N/A';
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

  showToast(header: string, message: string, type: 'success' | 'error' = 'success') {
    this.toasts.push({ header, message, type });
    setTimeout(() => this.removeToast(this.toasts[0]), 3500);
  }

  removeToast(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
