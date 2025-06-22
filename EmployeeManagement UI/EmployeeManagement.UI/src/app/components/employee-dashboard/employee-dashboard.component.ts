// Enhanced by Gemini
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as bootstrap from 'bootstrap'; // Import Bootstrap
import { AuthService } from '../../services/auth.service';
import { EmployeesService } from '../../services/employees.service';
import { TasksService } from '../../services/tasks.service';
import { MessageAnnouncementService } from '../../services/message-announcement.service';
import { PerformanceService } from '../../services/performance.service';
import { LeaveRequestsService } from '../../services/leave-requests.service';
import { AttendanceService, Attendance } from '../../services/attendance.service';
import { LeaveTypesService } from '../../services/leave-types.service';
import { NotificationService } from '../../services/notification.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  employee: any = null;
  tasks: any[] = [];
  announcements: any[] = [];
  performance: any = null;
  messages: any[] = [];
  activeSection: string = 'welcome';
  lastLoginTime: Date | null = null;

  leaveStats: any = { totalApplied: 0, pending: 0, approved: 0, rejected: 0, balance: 0 };
  attendanceStats: any = { presentDays: 0, absentDays: 0, lateCheckIns: 0 };
  editEmployee: any = {}; // Object to hold employee data for editing
  leaveTypes: any[] = []; // To store available leave types
  newLeaveRequest: any = {
    employeeId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    replacementEmployeeId: ''
  };
  leaveRequestsList: any[] = [];
  replacementEmployees: any[] = [];
  formError: string = '';

  attendanceRecords: Attendance[] = [];
  attendanceSummary = { present: 0, absent: 0, late: 0 };

  isMarkingTask: { [taskId: string]: boolean } = {};

  unreadAnnouncementsCount = 0;
  unreadMessagesCount = 0;

  isInitialLoading = true;
  isProfileLoading = false;
  isTasksLoading = false;
  isLeaveLoading = false;
  isAttendanceLoading = false;
  isPerformanceLoading = false;
  isAnnouncementsLoading = false;
  isMessagesLoading = false;

  performanceSnapshot: any = null;
  performanceTimeline: any[] = [];

  // New properties for the enhanced dashboard overview
  heroImages = [
    { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80', alt: 'A team collaborating in a modern office environment.' },
    { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80', alt: 'A professional presenting in a bright meeting room.' },
    { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', alt: 'Smiling colleagues working together on a laptop.' },
    { url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80', alt: 'Diverse group of people in a workshop.' }
  ];
  currentHeroImage = 0;
  private heroCarouselInterval: any;

  dashboardStats: any[] = [];

  private performanceSubSet = false;

  isProfileSaving = false;

  toasts: { header: string, message: string, type: 'success' | 'error' }[] = [];

  attendanceFilter = { start: null as Date | null, end: null as Date | null };
  filteredAttendanceRecords: any[] = [];
  showAttendanceDetailModal = false;
  selectedAttendanceRecord: any = null;
  highContrast = false;

  performanceFilter = { period: 'all', type: 'all' };
  filteredPerformanceTimeline: any[] = [];
  showPerformanceDetailModal = false;
  selectedPerformanceEvent: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private employeesService: EmployeesService,
    private tasksService: TasksService,
    private messageAnnouncementService: MessageAnnouncementService,
    private performanceService: PerformanceService,
    private leaveRequestsService: LeaveRequestsService,
    private attendanceService: AttendanceService,
    private leaveTypesService: LeaveTypesService,
    private notificationService: NotificationService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.lastLoginTime = new Date();

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user || !user.email) {
          this.toastr.error('Your session is invalid. Please log in again.', 'Authentication Error');
      this.router.navigate(['/login']);
      return;
    }

        this.employeesService.getEmployeeByEmail(user.email).subscribe({
      next: (response) => {
        this.employee = response;
        this.loadAllDashboardData();
            this.isInitialLoading = false;
        this.employeesService.getAllEmployees().subscribe({
          next: (allEmployees) => {
            this.replacementEmployees = allEmployees.filter((emp: any) => emp.empId !== this.employee.empId);
          },
          error: (err) => {
            console.error('Error loading replacement employees:', err);
            this.replacementEmployees = [];
          }
        });
        this.notificationService.startConnection(this.employee.empId);
        this.notificationService.taskAssigned$.subscribe((data) => {
          if (data && data.taskId) {
            this.toastr.info(data.message, 'New Task');
            this.loadTasks();
          }
        });
        this.notificationService.taskUpdated$.subscribe((data) => {
          if (data && data.taskId) {
            this.toastr.info(data.message, 'Task Updated');
            this.loadTasks();
          }
        });
        this.notificationService.taskDeleted$.subscribe((data) => {
          if (data && data.taskId) {
            this.toastr.info(data.message, 'Task Deleted');
            this.loadTasks();
          }
        });
        if (!this.performanceSubSet) {
          this.performanceSubSet = true;
          this.notificationService.performanceUpdated$.subscribe((data: any) => {
            this.toastr.info(data.message, 'Performance Update');
            this.loadPerformanceData();
          });
        }
        if (this.employee?.empId) {
          this.loadPerformanceData();
        }
        this.loadLeaveStats();
        this.loadAttendanceRecords();
        this.loadLeaveTypes();
        this.applyPerformanceFilters();
            this.setupDashboardStats();
            this.startHeroCarousel();
      },
      error: (err) => {
        console.error('Error loading employee profile:', err);
            this.toastr.error('Could not load your profile. Please try logging in again.', 'Error');
            this.router.navigate(['/login']);
            this.isInitialLoading = false;
          }
        });
      },
      error: (authError) => {
        console.error('Error getting current user from AuthService:', authError);
        this.toastr.error('An unexpected error occurred. Please log in again.', 'Error');
        this.router.navigate(['/login']);
      }
    });
  }

  loadAllDashboardData() {
    this.loadTasks();
    this.loadAnnouncements();
    this.loadPerformance();
    this.loadMessages();
    this.loadLeaveStats();
    this.loadAttendanceRecords();
    this.loadLeaveTypes();
    this.setupDashboardStats();
  }

  selectSection(section: string) {
    this.activeSection = section;
    if (section === 'leave') {
      this.loadLeaveStats(); // Always refresh leave data when navigating to Leave Overview
    }
  }

  loadTasks() {
    this.isTasksLoading = true;
    if (this.employee?.empId) {
      this.tasksService.getTasksByEmployeeId(this.employee.empId).subscribe({
        next: (response) => {
          this.tasks = response;
          this.setupDashboardStats(); // Recalculate stats whenever tasks are loaded
          this.isTasksLoading = false;
        },
        error: (err) => {
          console.error('Error loading tasks:', err);
          this.isTasksLoading = false;
        }
      });
    }
  }

  loadAnnouncements() {
    this.isAnnouncementsLoading = true;
    this.messageAnnouncementService.getAnnouncements().subscribe({
      next: (anns) => {
        this.announcements = anns;
        this.unreadAnnouncementsCount = anns.filter(a => !a.read).length;
        this.isAnnouncementsLoading = false;
      },
      error: (err) => {
        this.announcements = [];
        this.unreadAnnouncementsCount = 0;
        this.isAnnouncementsLoading = false;
      }
    });
  }

  loadMessages() {
    this.isMessagesLoading = true;
    this.messageAnnouncementService.getMessagesByRecipient(this.employee?.emailId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.unreadMessagesCount = msgs.filter(m => !m.read).length;
        this.setupDashboardStats(); // Recalculate stats
        this.isMessagesLoading = false;
      },
      error: (err) => {
        this.messages = [];
        this.unreadMessagesCount = 0;
        this.isMessagesLoading = false;
      }
    });
  }

  loadPerformance() {
    this.isPerformanceLoading = true;
    if (this.employee?.empId) {
      this.performanceService.getEmployeePerformanceById(this.employee.empId).subscribe({
        next: (response) => {
          this.performance = response;
          this.isPerformanceLoading = false;
        },
        error: (err) => {
          console.error('Error loading performance data:', err);
          this.performance = null; // Set to null if data not found or error occurs
          this.isPerformanceLoading = false;
        }
      });
    }
    else {
      this.performance = null; // Clear performance if no employee ID is available
      this.isPerformanceLoading = false;
    }
  }

  loadLeaveStats() {
    this.isLeaveLoading = true;
    if (this.employee?.empId) {
      this.leaveRequestsService.getLeaveRequestsByEmployeeId(this.employee.empId).subscribe({
        next: (leaveRequests) => {
          this.leaveRequestsList = leaveRequests;
          this.leaveStats.totalApplied = leaveRequests.length;
          this.leaveStats.pending = leaveRequests.filter(lr => lr.status === 'Pending').length;
          this.leaveStats.approved = leaveRequests.filter(lr => lr.status === 'Approved').length;
          this.leaveStats.rejected = leaveRequests.filter(lr => lr.status === 'Rejected').length;
          // Calculate leave balance - this would require a more sophisticated logic
          // For now, let's assume MaxDays from leaveType - approvedDays
          // This needs to be refined based on how you track leave balances
          this.leaveStats.balance = 0; // Placeholder for now
          if (this.leaveTypes.length > 0) {
            // Example: Sum of MaxDays from all leave types minus approved leaves
            const totalMaxDays = this.leaveTypes.reduce((sum, type) => sum + type.MaxDays, 0);
            const approvedDays = leaveRequests
              .filter(lr => lr.status === 'Approved')
              .reduce((sum, lr) => {
                const startDate = new Date(lr.startDate);
                const endDate = new Date(lr.endDate);
                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
                return sum + diffDays;
              }, 0);
            this.leaveStats.balance = totalMaxDays - approvedDays;
          }
          this.setupDashboardStats(); // Recalculate stats
          this.isLeaveLoading = false;
        },
        error: (err) => {
          console.error('Error loading leave stats:', err);
          // Reset to default if there's an error or no data
          this.leaveStats = { totalApplied: 0, pending: 0, approved: 0, rejected: 0, balance: 0 };
          this.leaveRequestsList = []; // Clear the list on error
          this.setupDashboardStats(); // Recalculate stats even on error
          this.isLeaveLoading = false;
        }
      });
    }
    else {
      this.leaveStats = { totalApplied: 0, pending: 0, approved: 0, rejected: 0, balance: 0 };
      this.leaveRequestsList = [];
      this.isLeaveLoading = false;
    }
  }

  loadAttendanceStats() {
    if (this.employee?.empId) {
      this.attendanceService.getAttendanceByEmployeeId(this.employee.empId).subscribe({
        next: (attendanceRecords) => {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          this.attendanceStats.presentDays = attendanceRecords.filter(record =>
            new Date(record.date).getMonth() === currentMonth &&
            new Date(record.date).getFullYear() === currentYear &&
            record.isPresent
          ).length;

          // To calculate absent days, we need total days in month - present days
          // This is a simplification; a more robust solution would check expected working days
          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          this.attendanceStats.absentDays = daysInMonth - this.attendanceStats.presentDays;

          this.attendanceStats.lateCheckIns = attendanceRecords.filter(record =>
            new Date(record.date).getMonth() === currentMonth &&
            new Date(record.date).getFullYear() === currentYear &&
            record.isLate
          ).length;
        },
        error: (err) => {
          console.error('Error loading attendance stats:', err);
          this.attendanceStats = { presentDays: 0, absentDays: 0, lateCheckIns: 0 };
        }
      });
    }
    else {
      this.attendanceStats = { presentDays: 0, absentDays: 0, lateCheckIns: 0 };
    }
  }

  loadAttendanceRecords() {
    this.isAttendanceLoading = true;
    if (this.employee?.empId) {
      this.attendanceService.getAttendanceByEmployeeId(this.employee.empId).subscribe({
        next: (attendanceRecords) => {
          this.attendanceRecords = attendanceRecords;
          // Calculate summary
          let present = 0, absent = 0, late = 0;
          attendanceRecords.forEach(r => {
            if (r.isPresent) present++;
            else absent++;
            if (r.isLate) late++;
          });
          this.attendanceSummary = { present, absent, late };
          this.isAttendanceLoading = false;
          this.filterAttendanceRecords();
        },
        error: (err) => {
          this.attendanceRecords = [];
          this.attendanceSummary = { present: 0, absent: 0, late: 0 };
          this.isAttendanceLoading = false;
          this.filterAttendanceRecords();
        }
      });
    } else {
      this.attendanceRecords = [];
      this.attendanceSummary = { present: 0, absent: 0, late: 0 };
      this.isAttendanceLoading = false;
      this.filterAttendanceRecords();
    }
  }

  loadLeaveTypes() {
    this.leaveTypesService.getLeaveTypesForRequests().subscribe({
      next: (response) => {
        this.leaveTypes = response;
      },
      error: (err) => {
        console.error('Error loading leave types:', err);
        this.leaveTypes = [];
      }
    });
  }

  openRequestLeaveModal() {
    // Reset the form for a new request
    this.newLeaveRequest = {
      employeeId: this.employee?.empId || '',
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: '',
      replacementEmployeeId: ''
    };
    const modalElement = document.getElementById('requestLeaveModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  submitLeaveRequest() {
    this.formError = '';
    // Ensure employeeId is set before validation and submission
    this.newLeaveRequest.employeeId = this.employee?.empId;
    console.log('Submitting leave request:', this.newLeaveRequest); // Debug log
    if (!this.newLeaveRequest.leaveTypeId || !this.newLeaveRequest.startDate || !this.newLeaveRequest.endDate || !this.newLeaveRequest.reason || !this.newLeaveRequest.replacementEmployeeId) {
      this.formError = 'Please fill in all required fields, including selecting a replacement employee.';
      return;
    }
    this.leaveRequestsService.addLeaveRequest(this.newLeaveRequest).subscribe({
      next: (response) => {
        alert('Leave request submitted successfully!');
        // Close the modal
        const modalElement = document.getElementById('requestLeaveModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
        // Reload leave stats to reflect the new request
        this.loadLeaveStats();
      },
      error: (err) => {
        this.formError = 'Failed to submit leave request. Please try again.';
      }
    });
  }

  showToast(header: string, message: string, type: 'success' | 'error' = 'success') {
    this.toasts.push({ header, message, type });
  }

  removeToast(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  markTaskCompleted(taskId: string) {
    if (this.isMarkingTask[taskId]) return; // Prevent double submission
    this.isMarkingTask[taskId] = true;
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      this.isMarkingTask[taskId] = false;
      return;
    }
    const updatedTask = { ...task, status: 'Completed' };
    this.tasksService.updateTask(taskId, updatedTask).subscribe({
      next: (res) => {
        this.showToast('Success', 'Task marked as completed!', 'success');
        this.loadTasks();
        this.isMarkingTask[taskId] = false;
      },
      error: (err) => {
        this.showToast('Error', 'Failed to mark task as completed.', 'error');
        this.isMarkingTask[taskId] = false;
      }
    });
  }

  editTask(taskId: string) {
    console.log('Editing task:', taskId);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openEditProfileModal() {
    if (this.employee) {
      // Create a deep copy to avoid direct modification of the displayed employee data
      this.editEmployee = { ...this.employee };
      const modalElement = document.getElementById('editProfileModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  onEditAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editEmployee.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfileChanges() {
      this.isProfileSaving = true;
    this.employeesService.updateEmployee(this.employee.empId, this.editEmployee).subscribe({
          next: (response) => {
        this.employee = response;
        this.showToast('Profile Updated', 'Your profile has been successfully updated.', 'success');
        this.isProfileSaving = false;
        // Manually close the modal
            const modalElement = document.getElementById('editProfileModal');
            if (modalElement) {
              const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
            }
        this.setupDashboardStats(); // Refresh stats after update
          },
          error: (err) => {
            this.isProfileSaving = false;
            this.toastr.error('Failed to update profile. Please try again.');
          }
        });
  }

  loadPerformanceData() {
    if (!this.employee?.empId) return;
    this.performanceService.getEmployeeSnapshot(this.employee.empId).subscribe(snap => this.performanceSnapshot = snap);
    this.performanceService.getEmployeeTimeline(this.employee.empId).subscribe(timeline => this.performanceTimeline = timeline);
  }

  filterAttendanceRecords() {
    if (!this.attendanceFilter.start && !this.attendanceFilter.end) {
      this.filteredAttendanceRecords = this.attendanceRecords;
      return;
    }
    this.filteredAttendanceRecords = this.attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const start = this.attendanceFilter.start ? new Date(this.attendanceFilter.start) : null;
      const end = this.attendanceFilter.end ? new Date(this.attendanceFilter.end) : null;
      if (start && end) {
        return recordDate >= start && recordDate <= end;
      } else if (start) {
        return recordDate >= start;
      } else if (end) {
        return recordDate <= end;
      }
      return true;
    });
  }

  ngOnChanges() {
    this.filterAttendanceRecords();
  }

  onAttendanceDateChange() {
    this.filterAttendanceRecords();
  }

  openAttendanceDetailModal(record: any) {
    this.selectedAttendanceRecord = record;
    this.showAttendanceDetailModal = true;
  }

  closeAttendanceDetailModal() {
    this.showAttendanceDetailModal = false;
    this.selectedAttendanceRecord = null;
  }

  exportAttendanceToCSV() {
    const records = this.filteredAttendanceRecords;
    if (!records || records.length === 0) {
      this.showToast('Export', 'No attendance records to export.', 'error');
      return;
    }
    const header = ['Date', 'Status', 'Late', 'Check-in Time', 'Check-out Time', 'Notes'];
    const rows = records.map(r => [
      r.date,
      r.isPresent ? 'Present' : 'Absent',
      r.isLate ? 'Yes' : 'No',
      r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-',
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-',
      r.notes || ''
    ]);
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.showToast('Export', 'Attendance log exported to CSV.', 'success');
  }

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    const body = document.body;
    if (this.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
  }

  applyPerformanceFilters() {
    if (!this.performanceTimeline) {
      this.filteredPerformanceTimeline = [];
      return;
    }
    this.filteredPerformanceTimeline = this.performanceTimeline.filter(event => {
      let periodMatch = true;
      let typeMatch = true;
      if (this.performanceFilter.period !== 'all') {
        const now = new Date();
        const eventDate = new Date(event.date);
        if (this.performanceFilter.period === 'month') {
          periodMatch = eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
        } else if (this.performanceFilter.period === 'quarter') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const eventQuarter = Math.floor(eventDate.getMonth() / 3);
          periodMatch = eventQuarter === currentQuarter && eventDate.getFullYear() === now.getFullYear();
        } else if (this.performanceFilter.period === 'year') {
          periodMatch = eventDate.getFullYear() === now.getFullYear();
        }
      }
      if (this.performanceFilter.type !== 'all') {
        typeMatch = event.type === this.performanceFilter.type;
      }
      return periodMatch && typeMatch;
    });
  }

  openPerformanceDetailModal(event: any) {
    this.selectedPerformanceEvent = event;
    this.showPerformanceDetailModal = true;
  }

  closePerformanceDetailModal() {
    this.showPerformanceDetailModal = false;
    this.selectedPerformanceEvent = null;
  }

  exportPerformanceToCSV() {
    const records = this.filteredPerformanceTimeline;
    if (!records || records.length === 0) {
      this.showToast('Export', 'No performance events to export.', 'error');
      return;
    }
    const header = ['Type', 'Description', 'Date', 'Feedback', 'Manager'];
    const rows = records.map(r => [
      r.type,
      r.description,
      r.date ? new Date(r.date).toLocaleDateString() : '',
      r.feedback || '',
      r.manager || ''
    ]);
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance-timeline.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.showToast('Export', 'Performance timeline exported to CSV.', 'success');
  }

  /**
   * Returns the avatar URL for the employee: uploaded photo if available, otherwise realistic gendered avatar
   */
  getEmployeeAvatar(employee: any): string {
    if (employee && employee.avatar) {
      // Check if it's a full URL or a path
      if (employee.avatar.startsWith('http') || employee.avatar.startsWith('data:image')) {
        return employee.avatar;
      }
      // Assuming it's a relative path to assets if not a full URL
      return `assets/${employee.avatar}`;
    }
    // Fallback to a default image if no avatar is present
    const seed = employee ? (employee.empId || employee.emailId || 'default') : 'default';
    return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}&backgroundColor=00897b,d81b60,8e24aa,3949ab,039be5,c0ca33,fdd835,fb8c00,e53935,6d4c41&backgroundType=gradient,solid&backgroundRotation=0,360,-360`;
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

  ngOnDestroy(): void {
    if (this.heroCarouselInterval) {
      clearInterval(this.heroCarouselInterval);
    }
  }

  // New methods for the enhanced dashboard
  startHeroCarousel(): void {
    this.heroCarouselInterval = setInterval(() => {
      this.currentHeroImage = (this.currentHeroImage + 1) % this.heroImages.length;
    }, 5000);
  }

  setupDashboardStats(): void {
    // This data should eventually come from your services
    this.dashboardStats = [
      {
        label: 'Pending Tasks',
        value: this.tasks.filter(t => t.status && t.status.toLowerCase() !== 'completed').length,
        icon: 'bi-list-check',
        bg: 'bg-warning',
        action: () => this.selectSection('tasks')
      },
      {
        label: 'Leave Balance',
        value: this.leaveStats.balance,
        sub: 'Days',
        icon: 'bi-calendar2-heart',
        bg: 'bg-success',
        action: () => this.selectSection('leave')
      },
      {
        label: 'Unread Messages',
        value: this.unreadMessagesCount,
        icon: 'bi-envelope-exclamation',
        bg: 'bg-info',
        action: () => this.selectSection('messages')
      },
      {
        label: 'Recent Announcements',
        value: this.unreadAnnouncementsCount,
        icon: 'bi-megaphone',
        bg: 'bg-primary',
        action: () => this.selectSection('announcements')
      }
    ];
  }
} 