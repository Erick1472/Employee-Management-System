import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PerformanceService } from '../../services/performance.service';
import { TopPerformer } from '../../models/performance.model';
import { SettingsService } from '../../services/settings.service';
import { GeneralSettings, SecuritySettings } from '../../models/settings.model';
import { EmployeesService } from '../../services/employees.service';
import { DepartmentsService } from '../../services/departments.service';
import { LeaveRequestsService } from '../../services/leave-requests.service';
import { LeaveTypesService } from '../../services/leave-types.service';
import { SalariesService } from '../../services/salaries.service';
import { MessageAnnouncementService } from '../../services/message-announcement.service';
import { Message, Announcement } from '../../models/message-announcement.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { AttendanceService, Attendance } from '../../services/attendance.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

interface User {
  email: string;
  token: string;
  role: string;
  name: string;
  avatar: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  sidebarToggled = false;
  activeSection: string = 'dashboard'; // Default active section
  showAddEmployeeForm: boolean = false; // Control visibility of the add employee form
  currentUser: User | null = null;
  private userSubscription: Subscription | undefined;

  // Dashboard Statistics
  totalEmployees: number = 0;
  activeEmployees: number = 0;
  inactiveEmployees: number = 0;
  totalDepartments: number = 0;
  departmentHeads: number = 0;
  totalLeaveRequests: number = 0;
  newLeaveRequests: number = 0;
  pendingLeaveRequests: number = 0;
  totalLeaveTypes: number = 0;
  activeLeaveTypes: number = 0;

  // Notifications and Activities
  notifications: any[] = [];
  recentActivities: any[] = [];

  // Department Management
  departments: any[] = [];

  // Leave Type Management
  leaveTypes: any[] = [];

  // Employee Management
  employees: any[] = [];

  // Salary Management
  salaries: any[] = [];

  // Leave Request Management
  leaveRequests: any[] = [];

  // Tasks Management
  tasks: any[] = [];

  // Messages and Announcements
  messages: Message[] = [];
  announcements: Announcement[] = [];
  showNewMessageForm = false;
  showNewAnnouncementForm = false;
  messageSearch = '';
  announcementSearch = '';

  newMessage: Partial<Message> = { subject: '', content: '' };
  newAnnouncement: Partial<Announcement> = { title: '', content: '' };

  // Performance Management
  topPerformers: TopPerformer[] = [];

  // Settings
  settings: GeneralSettings = {
    companyName: '',
    email: '',
    theme: 'light'
  };

  // Security Settings
  security: SecuritySettings = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Profile
  profile: any = {
    name: 'Admin User',
    position: 'System Administrator',
    email: 'admin@example.com',
    department: 'IT',
    phone: '+1234567890',
    lastLogin: new Date(),
    avatar: null
  };

  // Reports
  reportType: string | null = null;
  reportData: any[] = [];

  // Settings properties for the admin settings section
  isDarkTheme = false;
  companyLogoUrl: string | null = null;
  notifyEmail = true;
  notifySMS = false;
  notifyInApp = true;
  recentLogins: Date[] = [
    new Date(),
    new Date(Date.now() - 86400000),
    new Date(Date.now() - 2 * 86400000)
  ];

  attendanceToday: Attendance[] = [];
  selectedAttendance: Attendance | null = null;
  markAttendanceForm: Partial<Attendance> = {};
  showMarkAttendanceModal: boolean = false;
  showEditAttendanceModal: boolean = false;

  attendanceTableRows: any[] = [];

  isMarkingAttendance: { [empId: string]: boolean } = {};

  attendanceDate: string = new Date().toISOString().split('T')[0];

  sendingMessage = false;
  sendingAnnouncement = false;

  performanceFeed: any[] = [];
  needsAttention: any[] = [];

  showEditProfileModal = false;
  editProfile: any = {};

  performanceFilter = { department: 'all', period: 'all', type: 'all' };
  filteredPerformanceFeed: any[] = [];
  showPerformanceDetailModal = false;
  selectedPerformanceEvent: any = null;
  toasts: { type: 'success' | 'error', message: string, header?: string }[] = [];

  reportSummary: any = { totalEmployees: 0, totalLeaves: 0, totalSalary: 0, totalDepartments: 0 };
  reportFilter = { startDate: '', endDate: '', department: 'all', status: 'all' };
  filteredReportData: any[] = [];
  reportColumns: string[] = [];
  selectedReportRows: string[] = [];
  allReportSelected: boolean = false;
  showReportDetailModal = false;
  selectedReportDetail: any = null;

  performanceSummary: any = { avgAttendance: 0, tasksCompleted: 0, recognitions: 0 };

  heroImages = [
    { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', alt: 'Team of employees collaborating at computers in a modern office' },
    { url: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?auto=format&fit=crop&w=800&q=80', alt: 'Woman working on laptop in a bright office' },
    { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', alt: 'Coworkers discussing project at computer desk' },
    { url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80', alt: 'People collaborating at a table with laptops' },
    { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80', alt: 'Coworkers brainstorming in front of computer screens' },
    { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', alt: 'Employees working at desks with computers' },
    { url: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=800&q=80', alt: 'Office team meeting with laptops and digital devices' }
  ];
  currentHeroImage = 0;
  private heroCarouselInterval: any;

  showPromoteEmployeeModal = false;
  selectedEmployeeToPromote: any = null;
  promotePosition: string = '';

  noNotificationsLottieOptions = {
    path: 'assets/no-notifications.json',
    loop: true,
    autoplay: true
  };
  noActivitiesLottieOptions = {
    path: 'assets/no-activities.json',
    loop: true,
    autoplay: true
  };

  // Motivational/Onboarding Carousel
  carouselSlides = [
    {
      lottie: 'assets/no-activities.json',
      headline: 'Great teams are built on trust and communication.',
      message: 'Foster collaboration and celebrate every win together.'
    },
    {
      lottie: 'assets/no-notifications.json',
      headline: 'Track your goals, celebrate your wins!',
      message: 'Stay on top of performance and reward achievements.'
    },
    {
      lottie: 'assets/no-activities.json',
      headline: 'Welcome! Start by adding your first employee.',
      message: 'Get started by building your dream team.'
    }
  ];
  currentCarouselIndex = 0;
  carouselInterval: any;

  // Advanced Onboarding State
  onboardingSlides = [
    {
      img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      alt: 'Team of employees collaborating at computers in a modern office',
      headline: 'Add your first employee',
      message: 'Start building your team by adding an employee.',
      action: () => this.selectSection('employee'),
      actionLabel: 'Add Employee',
      completed: false
    },
    {
      img: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?auto=format&fit=crop&w=800&q=80',
      alt: 'Woman working on laptop in a bright office',
      headline: 'Set up your departments',
      message: 'Organize your company by creating departments.',
      action: () => this.selectSection('department'),
      actionLabel: 'Set Up Departments',
      completed: false
    },
    {
      img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      alt: 'Coworkers discussing project at computer desk',
      headline: 'Customize your company profile',
      message: 'Add your company logo and details for a personalized experience.',
      action: () => this.selectSection('settings'),
      actionLabel: 'Customize Profile',
      completed: false
    },
    {
      img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
      alt: 'People collaborating at a table with laptops',
      headline: 'Invite a manager',
      message: 'Empower your team by inviting a manager to the system.',
      action: () => this.selectSection('employee'),
      actionLabel: 'Invite Manager',
      completed: false
    },
    {
      img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      alt: 'Coworkers brainstorming in front of computer screens',
      headline: 'Explore reports & analytics',
      message: 'Gain insights into your organization\'s performance.',
      action: () => this.selectSection('report'),
      actionLabel: 'View Reports',
      completed: false
    },
    {
      img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      alt: 'Employees working at desks with computers',
      headline: 'Mark attendance',
      message: 'Track daily attendance for your employees.',
      action: () => this.selectSection('attendance'),
      actionLabel: 'Mark Attendance',
      completed: false
    },
    {
      img: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=800&q=80',
      alt: 'Office team meeting with laptops and digital devices',
      headline: 'You\'re all set!',
      message: 'You\'ve completed onboarding. Enjoy managing your team!',
      action: () => this.closeWelcomeModal(),
      actionLabel: 'Finish',
      completed: false
    }
  ];
  onboardingIndex = 0;
  onboardingInterval: any;
  showWelcomeModal = true;
  onboardingChecklist = [
    { label: 'Add your first employee', completed: false, action: () => this.selectSection('employee') },
    { label: 'Set up departments', completed: false, action: () => this.selectSection('department') },
    { label: 'Customize company profile', completed: false, action: () => this.selectSection('settings') },
    { label: 'Invite a manager', completed: false, action: () => this.selectSection('employee') },
    { label: 'Explore reports & analytics', completed: false, action: () => this.selectSection('report') },
    { label: 'Mark attendance', completed: false, action: () => this.selectSection('attendance') },
    { label: 'Finish onboarding', completed: false, action: () => this.closeWelcomeModal() }
  ];

  // Contextual tooltips state
  sectionTooltips: { [key: string]: boolean } = {
    employee: true,
    department: true,
    settings: true,
    report: true,
    attendance: true
  };

  showSectionTooltip(section: string): boolean {
    return this.sectionTooltips[section];
  }

  dismissSectionTooltip(section: string): void {
    this.sectionTooltips[section] = false;
  }

  get dashboardStats() {
    return [
      { label: 'Total Employees', value: this.totalEmployees || 0, sub: `Active: ${this.activeEmployees || 0} | Inactive: ${this.inactiveEmployees || 0}`, icon: 'bi-people-fill', bg: 'bg-primary' },
      { label: 'Departments', value: this.totalDepartments || 0, sub: `Total Department Heads: ${this.departmentHeads || 0}`, icon: 'bi-building', bg: 'bg-success' },
      { label: 'Leave Requests', value: this.totalLeaveRequests || 0, sub: `New: ${this.newLeaveRequests || 0} | Pending: ${this.pendingLeaveRequests || 0}`, icon: 'bi-calendar-check', bg: 'bg-warning' },
      { label: 'Leave Types', value: this.totalLeaveTypes || 0, sub: `Active Types: ${this.activeLeaveTypes || 0}`, icon: 'bi-briefcase', bg: 'bg-info' }
    ];
  }

  attendanceSearch: string = '';
  filteredAttendanceTableRows: any[] = [];

  constructor(
    private router: Router,
    private performanceService: PerformanceService,
    private settingsService: SettingsService,
    private employeesService: EmployeesService,
    private departmentsService: DepartmentsService,
    private leaveRequestsService: LeaveRequestsService,
    private leaveTypesService: LeaveTypesService,
    private salariesService: SalariesService,
    private messageAnnouncementService: MessageAnnouncementService,
    private toastr: ToastrService,
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.router.routerState.root.queryParams.subscribe(params => {
      if (params['section']) {
        this.activeSection = params['section'];
        this.updateFormVisibility();
        if (this.activeSection === 'attendance') {
          this.loadTodayAttendance();
        }
      } else {
        // Default load for dashboard on initial page load
        this.loadDashboardData();
        this.loadEmployees();
      }
    });

    this.leaveRequestsService.getPendingLeaveRequestsCount().subscribe({
      next: (count: number) => {
        this.pendingLeaveRequests = count;
      },
      error: (err: any) => {
        console.error('Error fetching pending leave requests count', err);
      }
    });

    this.leaveTypesService.getTotalLeaveTypesCount().subscribe({
      next: (count: number) => {
        this.totalLeaveTypes = count;
      },
      error: (err: any) => {
        console.error('Error fetching total leave types count', err);
      }
    });

    this.leaveTypesService.getActiveLeaveTypesCount().subscribe({
      next: (count: number) => {
        this.activeLeaveTypes = count;
      },
      error: (err: any) => {
        console.error('Error fetching active leave types count', err);
      }
    });

    if (this.activeSection === 'performance') {
      // Placeholder for performance charts
    }

    if (this.activeSection === 'messages') {
      this.loadMessages();
      this.loadAnnouncements();
    }

    if (this.activeSection === 'attendance') {
      this.loadTodayAttendance();
    }

    this.messageAnnouncementService.startConnection();
    this.messageAnnouncementService.onMessageReceived((msg) => {
      this.messages.unshift(msg);
      this.toastr.info('New message received!');
    });
    this.messageAnnouncementService.onAnnouncementReceived((ann) => {
      this.announcements.unshift(ann);
      this.toastr.info('New announcement!');
    });

    // Start SignalR for real-time task updates (admin userId: 'admin')
    this.notificationService.startConnection('admin');
    this.notificationService.taskAssigned$.subscribe((data) => {
      this.toastr.info('A new task was assigned.', 'Task Update');
      this.loadTasks();
    });
    this.notificationService.taskUpdated$.subscribe((data) => {
      this.toastr.info('A task was updated.', 'Task Update');
      this.loadTasks();
    });
    this.notificationService.taskDeleted$.subscribe((data) => {
      this.toastr.info('A task was deleted.', 'Task Update');
      this.loadTasks();
    });

    this.employeesService.getAllEmployees().subscribe({
      next: (emps) => { this.employees = emps; },
      error: (err) => { console.error('Failed to load employees', err); }
    });

    this.loadPerformanceData();
    this.applyPerformanceFilters();
    this.applyReportFilters();
    // Optionally, set performanceSummary from data if available
    if (this.performanceFeed && this.performanceFeed.length > 0) {
      // Example: calculate summary from feed (customize as needed)
      this.performanceSummary.avgAttendance = Math.round(Math.random() * 100); // Placeholder
      this.performanceSummary.tasksCompleted = this.performanceFeed.filter(e => e.type === 'Task').length;
      this.performanceSummary.recognitions = this.performanceFeed.filter(e => e.type === 'Recognition').length;
    }

    this.startHeroCarousel();
    this.startCarousel();
    this.startOnboardingCarousel();

    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.initializeProfileData();
      }
    });
  }

  private initializeProfileData(): void {
    if (this.currentUser) {
      this.profile = {
        name: this.currentUser.name,
        position: 'System Administrator',
        email: this.currentUser.email,
        department: 'IT',
        phone: this.profile.phone || '+1234567890',
        lastLogin: this.profile.lastLogin || new Date(),
        avatar: this.currentUser.avatar
      };
    }
  }

  ngAfterViewInit(): void {
    // Placeholder for AfterViewInit lifecycle if needed
  }

  ngOnDestroy(): void {
    if (this.heroCarouselInterval) {
      clearInterval(this.heroCarouselInterval);
    }
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    if (this.onboardingInterval) {
      clearInterval(this.onboardingInterval);
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.sidebarToggled = !this.sidebarToggled;
  }

  selectSection(section: string): void {
    this.activeSection = section;
    if (section === 'attendance') {
      this.loadEmployees();
      this.loadTodayAttendance();
    }
  }

  private updateFormVisibility(): void {
    if (this.activeSection === 'employee') {
      this.showAddEmployeeForm = false; // By default, show the employee list, not the add form
      this.loadEmployees(); // Ensure employees are loaded when switching to employee section
    } else {
      this.showAddEmployeeForm = false;
    }
    this.showNewMessageForm = this.activeSection === 'messages';
    this.showNewAnnouncementForm = this.activeSection === 'announcements';
    if (this.activeSection === 'performance') {
      this.loadTopPerformers();
    }
    if (this.activeSection === 'settings') {
      this.loadSettings();
    }
    if (this.activeSection === 'dashboard' || this.activeSection === 'employee') {
      this.loadTotalEmployees();
    }
  }

  logout(event?: Event): void {
    if (event) event.preventDefault();
    this.authService.logout();
    this.toastr.success('You have been logged out.');
    this.router.navigate(['/login']);
  }

  // Dashboard Methods
  private loadDashboardData(): void {
    // Implement API calls to load dashboard data
    this.loadStatistics();
    this.loadNotifications();
    this.loadRecentActivities();
  }

  private loadStatistics(): void {
    // Implement API call to load statistics, including total employees
    this.loadTotalEmployees();

    this.departmentsService.getTotalDepartmentsCount().subscribe({
      next: (count: number) => {
        this.totalDepartments = count;
      },
      error: (err: any) => {
        console.error('Error fetching total departments count', err);
      }
    });

    this.departmentsService.getDepartmentHeadsCount().subscribe({
      next: (count: number) => {
        this.departmentHeads = count;
      },
      error: (err: any) => {
        console.error('Error fetching department heads count', err);
      }
    });

    this.leaveRequestsService.getTotalLeaveRequestsCount().subscribe({
      next: (count: number) => {
        this.totalLeaveRequests = count;
      },
      error: (err: any) => {
        console.error('Error fetching total leave requests count', err);
      }
    });

    this.leaveRequestsService.getNewLeaveRequestsCount().subscribe({
      next: (count: number) => {
        this.newLeaveRequests = count;
      },
      error: (err: any) => {
        console.error('Error fetching new leave requests count', err);
      }
    });

    this.leaveRequestsService.getPendingLeaveRequestsCount().subscribe({
      next: (count: number) => {
        this.pendingLeaveRequests = count;
      },
      error: (err: any) => {
        console.error('Error fetching pending leave requests count', err);
      }
    });

    this.leaveTypesService.getTotalLeaveTypesCount().subscribe({
      next: (count: number) => {
        this.totalLeaveTypes = count;
      },
      error: (err: any) => {
        console.error('Error fetching total leave types count', err);
      }
    });

    this.leaveTypesService.getActiveLeaveTypesCount().subscribe({
      next: (count: number) => {
        this.activeLeaveTypes = count;
      },
      error: (err: any) => {
        console.error('Error fetching active leave types count', err);
      }
    });
  }

  private loadNotifications(): void {
    // TODO: Implement API call to load notifications
  }

  private loadRecentActivities(): void {
    // TODO: Implement API call to load recent activities
  }

  private loadTotalEmployees(): void {
    this.employeesService.getEmployeesCount().subscribe({
      next: (count: number) => {
        this.totalEmployees = count;
      },
      error: (err: any) => {
        console.error('Error fetching total employees count', err);
      }
    });
  }

  // New method to load all employees
  private loadEmployees(): void {
    this.employeesService.getAllEmployees().subscribe({
      next: (employees: any[]) => {
        this.employees = employees;
        this.activeEmployees = employees.filter(e => e.status === 'Active').length;
        this.inactiveEmployees = employees.filter(e => e.status !== 'Active').length;
        // Optionally, update department heads if needed
      },
      error: (err: any) => {
        console.error('Error fetching employees', err);
      }
    });
  }

  // Department Management Methods
  openAddDepartmentModal(): void {
    // TODO: Implement add department modal
  }

  editDepartment(department: any): void {
    // TODO: Implement edit department
  }

  deleteDepartment(department: any): void {
    // TODO: Implement delete department
  }

  // Leave Type Management Methods
  openAddLeaveTypeModal(): void {
    // TODO: Implement add leave type modal
  }

  editLeaveType(leaveType: any): void {
    // TODO: Implement edit leave type
  }

  deleteLeaveType(leaveType: any): void {
    // TODO: Implement delete leave type
  }

  // Employee Management Methods
  viewEmployee(employee: any): void {
    // TODO: Implement view employee details
  }

  editEmployee(employee: any): void {
    // TODO: Implement edit employee
  }

  deleteEmployee(employee: any): void {
    // TODO: Implement delete employee
  }

  // Salary Management Methods
  openAddSalaryModal(): void {
    // TODO: Implement add salary modal
  }

  viewSalaryDetails(salary: any): void {
    // TODO: Implement view salary details
  }

  generatePayslip(salary: any): void {
    // TODO: Implement generate payslip
  }

  editSalary(salary: any): void {
    // TODO: Implement edit salary
  }

  // Leave Request Management Methods
  filterLeaveRequests(status: string): void {
    // TODO: Implement filter leave requests
  }

  approveLeaveRequest(request: any): void {
    this.leaveRequestsService.approveLeaveRequest(request.id).subscribe({
      next: () => {
        this.toastr.success('Leave request approved!');
        this.refreshLeaveRequestsAndStats();
      },
      error: () => {
        this.toastr.error('Failed to approve leave request.');
      }
    });
  }

  rejectLeaveRequest(request: any): void {
    this.leaveRequestsService.rejectLeaveRequest(request.id).subscribe({
      next: () => {
        this.toastr.success('Leave request rejected!');
        this.refreshLeaveRequestsAndStats();
      },
      error: () => {
        this.toastr.error('Failed to reject leave request.');
      }
    });
  }

  viewLeaveRequestDetails(request: any): void {
    // TODO: Implement view leave request details
  }

  private refreshLeaveRequestsAndStats(): void {
    this.leaveRequestsService.getAllLeaveRequests().subscribe({
      next: (requests) => {
        this.leaveRequests = requests;
      }
    });
    this.leaveRequestsService.getTotalLeaveRequestsCount().subscribe(count => this.totalLeaveRequests = count);
    this.leaveRequestsService.getNewLeaveRequestsCount().subscribe(count => this.newLeaveRequests = count);
    this.leaveRequestsService.getPendingLeaveRequestsCount().subscribe(count => this.pendingLeaveRequests = count);
  }

  // Reports Methods
  generateReport(type: string): void {
    this.reportType = type;
    if (type === 'salary') {
      this.fetchSalaryReport();
    } else if (type === 'attendance') {
      this.fetchAttendanceReport();
    } else if (type === 'leave') {
      this.fetchLeaveReport();
    } else if (type === 'department') {
      this.fetchDepartmentPerformanceReport();
    }
  }

  fetchSalaryReport(): void {
    // Example: fetch salary records and enrich with employee info
    this.salariesService.getAllSalaryRecords().subscribe(records => {
      this.employeesService.getAllEmployees().subscribe(employees => {
        this.reportData = records.map(record => ({
          ...record,
          employee: employees.find(emp => emp.empId === record.employeeId)
        }));
      });
    });
  }

  fetchAttendanceReport(): void {
    // Mock data for attendance
    this.reportData = [
      { employee: { firstName: 'Alex', lastName: 'Kuria', empId: 'Emp001', department: 'ICT' }, date: '2025-07-01', status: 'Present' },
      { employee: { firstName: 'Jane', lastName: 'Doe', empId: 'Emp002', department: 'Finance' }, date: '2025-07-01', status: 'Absent' },
      { employee: { firstName: 'Alex', lastName: 'Kuria', empId: 'Emp001', department: 'ICT' }, date: '2025-07-02', status: 'Late' }
    ];
  }

  fetchLeaveReport(): void {
    // Mock data for leave summary
    this.reportData = [
      { employee: { firstName: 'Alex', lastName: 'Kuria', empId: 'Emp001', department: 'ICT' }, leaveType: 'Annual', startDate: '2025-07-10', endDate: '2025-07-15', days: 5, status: 'Approved' },
      { employee: { firstName: 'Jane', lastName: 'Doe', empId: 'Emp002', department: 'Finance' }, leaveType: 'Sick', startDate: '2025-07-05', endDate: '2025-07-07', days: 2, status: 'Pending' }
    ];
  }

  fetchDepartmentPerformanceReport(): void {
    // Mock data for department performance
    this.reportData = [
      { department: 'ICT', totalEmployees: 10, avgSalary: 60000, avgAttendance: 95, totalLeaves: 12 },
      { department: 'Finance', totalEmployees: 8, avgSalary: 55000, avgAttendance: 92, totalLeaves: 15 }
    ];
  }

  // Tasks Methods
  openAddTaskModal(): void {
    // TODO: Implement add task modal
  }

  viewTaskDetails(task: any): void {
    // TODO: Implement view task details
  }

  editTask(task: any): void {
    // TODO: Implement edit task
  }

  deleteTask(task: any): void {
    // TODO: Implement delete task
  }

  // Messages Methods
  toggleNewMessageForm(): void {
    this.showNewMessageForm = !this.showNewMessageForm;
  }

  toggleNewAnnouncementForm(): void {
    this.showNewAnnouncementForm = !this.showNewAnnouncementForm;
  }

  openNewMessageModal(): void {
    // TODO: Implement new message modal
  }

  openNewAnnouncementModal(): void {
    // TODO: Implement new announcement modal
  }

  // Profile Methods
  openEditProfileModal(): void {
    // Initialize edit profile with current user data if available, otherwise use profile data
    if (this.currentUser) {
      this.editProfile = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        avatar: this.currentUser.avatar,
        phone: this.profile.phone || '',
        position: this.profile.position || 'System Administrator',
        department: this.profile.department || 'IT',
        lastLogin: this.profile.lastLogin || new Date()
      };
    } else {
    this.editProfile = { ...this.profile };
    }
    this.showEditProfileModal = true;
  }

  onEditAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editProfile.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    this.profile = { ...this.editProfile };
    
    // Sync the profile changes with the currentUser object
    if (this.currentUser) {
      console.log('Before update - currentUser avatar:', this.currentUser.avatar);
      console.log('New avatar from editProfile:', this.editProfile.avatar);
      
      this.currentUser.name = this.editProfile.name;
      this.currentUser.email = this.editProfile.email;
      this.currentUser.avatar = this.editProfile.avatar;
      
      console.log('After update - currentUser avatar:', this.currentUser.avatar);
      
      // Update the auth service with the new user data
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      
      // Force the auth service to emit the updated user
      this.authService.updateCurrentUser(this.currentUser);
    }
    
    this.showEditProfileModal = false;
    this.toastr.success('Profile updated successfully!');
  }

  // Utility Methods
  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-danger';
      case 'on leave':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  getLeaveStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getTaskStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'in progress':
        return 'bg-warning';
      case 'pending':
        return 'bg-info';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  // Performance Methods
  private loadTopPerformers(): void {
    this.performanceService.getTopPerformers().subscribe(
      (data: TopPerformer[]) => {
        this.topPerformers = data;
      },
      (error: any) => {
        console.error('Error fetching top performers', error);
      }
    );
  }

  // Settings Methods
  private loadSettings(): void {
    this.settingsService.getGeneralSettings().subscribe(
      (data: GeneralSettings) => {
        this.settings = data;
      },
      (error: any) => {
        console.error('Error fetching general settings', error);
      }
    );
  }

  saveGeneralSettings(): void {
    this.settingsService.updateGeneralSettings(this.settings).subscribe(
      (response: GeneralSettings) => {
        console.log('General settings updated successfully', response);
        this.toastr.success('General settings saved successfully!');
      },
      (error: any) => {
        console.error('Error saving general settings', error);
        this.toastr.error('Error saving general settings: ' + (error.error || error.message));
      }
    );
  }

  updatePassword(): void {
    if (this.security.newPassword !== this.security.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    this.settingsService.updatePassword(this.security).subscribe(
      (response: any) => {
        console.log('Password updated successfully', response);
        this.toastr.success('Password updated successfully!');
        this.security.currentPassword = '';
        this.security.newPassword = '';
        this.security.confirmPassword = '';
      },
      (error: any) => {
        console.error('Error updating password', error);
        this.toastr.error('Error updating password: ' + (error.error || error.message));
      }
    );
  }

  exportReportToCSV(): void {
    if (!this.reportData || this.reportData.length === 0) {
      alert('No data to export.');
      return;
    }
    let csvContent = '';
    if (this.reportType === 'salary') {
      csvContent += 'Employee,Emp ID,Department,Month,Net Salary,Payment Date\n';
      this.reportData.forEach(record => {
        csvContent += `"${record.employee?.firstName || ''} ${record.employee?.lastName || ''}",` +
          `"${record.employee?.empId || ''}",` +
          `"${record.employee?.department || ''}",` +
          `"${record.month}",` +
          `"${record.netSalary}",` +
          `"${record.paymentDate}"
`;
      });
    } else if (this.reportType === 'attendance') {
      csvContent += 'Employee,Emp ID,Department,Date,Status\n';
      this.reportData.forEach(record => {
        csvContent += `"${record.employee?.firstName || ''} ${record.employee?.lastName || ''}",` +
          `"${record.employee?.empId || ''}",` +
          `"${record.employee?.department || ''}",` +
          `"${record.date}",` +
          `"${record.status}"
`;
      });
    } else if (this.reportType === 'leave') {
      csvContent += 'Employee,Emp ID,Department,Leave Type,Start Date,End Date,Days,Status\n';
      this.reportData.forEach(record => {
        csvContent += `"${record.employee?.firstName || ''} ${record.employee?.lastName || ''}",` +
          `"${record.employee?.empId || ''}",` +
          `"${record.employee?.department || ''}",` +
          `"${record.leaveType}",` +
          `"${record.startDate}",` +
          `"${record.endDate}",` +
          `"${record.days}",` +
          `"${record.status}"
`;
      });
    } else if (this.reportType === 'department') {
      csvContent += 'Department,Total Employees,Avg Salary,Avg Attendance,Total Leaves\n';
      this.reportData.forEach(record => {
        csvContent += `"${record.department}",` +
          `"${record.totalEmployees}",` +
          `"${record.avgSalary}",` +
          `"${record.avgAttendance}",` +
          `"${record.totalLeaves}"
`;
      });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${this.reportType || 'report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Theme switcher
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }

  // Company logo upload
  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.companyLogoUrl = e.target.result;
        // TODO: Upload to backend if needed
      };
      reader.readAsDataURL(file);
    }
  }

  saveNotificationPrefs(): void {
    alert('Notification preferences saved!');
  }

  backupData(): void {
    this.settingsService.downloadBackup().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employee-backup.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      this.toastr.success('Backup downloaded!');
    }, err => {
      this.toastr.error('Failed to download backup.');
    });
  }

  exportAuditLog(): void {
    this.settingsService.downloadAuditLog().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-log.txt';
      a.click();
      window.URL.revokeObjectURL(url);
      this.toastr.success('Audit log downloaded!');
    }, err => {
      this.toastr.error('Failed to download audit log.');
    });
  }

  openChangePasswordModal(): void {
    alert('Change Password modal would open here.');
  }

  filteredMessages() {
    return this.messages.filter(m =>
      m.sender.toLowerCase().includes(this.messageSearch.toLowerCase()) ||
      m.subject.toLowerCase().includes(this.messageSearch.toLowerCase())
    );
  }

  filteredAnnouncements() {
    return this.announcements.filter(a =>
      a.title.toLowerCase().includes(this.announcementSearch.toLowerCase()) ||
      a.content.toLowerCase().includes(this.announcementSearch.toLowerCase())
    );
  }

  sendMessage() {
    if (!this.newMessage.receiver || !this.newMessage.subject || !this.newMessage.content) return;
    this.sendingMessage = true;
    if (this.newMessage.receiver === 'all') {
      // Send as announcement
      this.createAnnouncement(this.newAnnouncement);
      this.sendingMessage = false;
      return;
    }
    this.messageAnnouncementService.sendMessage({
      sender: 'Admin',
      receiver: this.newMessage.receiver,
      subject: this.newMessage.subject!,
      content: this.newMessage.content!,
      time: new Date(),
      read: false
    }).subscribe({
      next: (msg) => {
        this.toastr.success('Message delivered!');
        this.sendingMessage = false;
        // Optionally log/audit
      },
      error: (err) => {
        this.toastr.error('Failed to send message');
        this.sendingMessage = false;
      }
    });
    this.newMessage = { receiver: '', subject: '', content: '', sender: 'Admin', time: new Date(), read: false };
    this.showNewMessageForm = false;
  }

  replyToMessage(msg: Message) {
    this.showNewMessageForm = true;
    this.newMessage.subject = 'Re: ' + msg.subject;
    this.newMessage.content = '';
  }

  markAsRead(msg: Message) {
    msg.read = true;
    // Optionally, update backend
  }

  deleteMessage(msg: Message) {
    if (confirm('Delete this message?')) {
      // Optionally, call backend delete
      this.messages = this.messages.filter(m => m !== msg);
    }
  }

  createAnnouncement(ann: Partial<Announcement>) {
    if (ann.title && ann.content) {
      this.sendingAnnouncement = true;
      this.messageAnnouncementService.createAnnouncement({
        title: ann.title!,
        content: ann.content!,
        author: 'Admin',
        date: new Date()
      }).subscribe({
        next: (createdAnn) => {
          this.announcements.unshift(createdAnn);
          this.toastr.success('Announcement delivered!');
          this.sendingAnnouncement = false;
          // Optionally log/audit
        },
        error: (err) => {
          this.toastr.error('Failed to send announcement');
          this.sendingAnnouncement = false;
        }
      });
    }
    this.newAnnouncement = { title: '', content: '', author: 'Admin', date: new Date() };
    this.showNewAnnouncementForm = false;
  }

  editAnnouncement(ann: Announcement) {
    this.showNewAnnouncementForm = true;
    this.newAnnouncement = { ...ann };
  }

  deleteAnnouncement(ann: Announcement) {
    if (confirm('Delete this announcement?')) {
      // Optionally, call backend delete
      this.announcements = this.announcements.filter(a => a !== ann);
    }
  }

  loadMessages(): void {
    this.messageAnnouncementService.getMessages().subscribe({
      next: (msgs) => { this.messages = msgs; },
      error: (err) => { console.error('Failed to load messages', err); }
    });
  }

  loadAnnouncements(): void {
    this.messageAnnouncementService.getAnnouncements().subscribe({
      next: (anns) => { this.announcements = anns; },
      error: (err) => { console.error('Failed to load announcements', err); }
    });
  }

  deleteLeaveRequest(request: any): void {
    if (confirm('Are you sure you want to delete this leave request?')) {
      this.leaveRequestsService.deleteLeaveRequest(request.id).subscribe({
        next: () => {
          this.toastr.success('Leave request deleted!');
          this.refreshLeaveRequestsAndStats();
        },
        error: () => {
          this.toastr.error('Failed to delete leave request.');
        }
      });
    }
  }

  loadTodayAttendance() {
    this.attendanceService.getAttendanceByDate(this.attendanceDate).subscribe({
      next: (records) => {
        this.attendanceToday = records;
        this.buildAttendanceTableRows();
      },
      error: () => {
        this.attendanceToday = [];
        this.buildAttendanceTableRows();
      }
    });
  }

  onAttendanceDateChange() {
    this.loadTodayAttendance();
  }

  buildAttendanceTableRows() {
    // For each employee, find their attendance for today (if any)
    this.attendanceTableRows = this.employees.map(emp => {
      const attendance = this.attendanceToday.find(a => a.employeeId === emp.empId);
      return {
        employee: emp,
        attendance: attendance || null
      };
    });
    this.filterAttendanceTableRows();
  }

  openMarkAttendanceModal(employee: any) {
    this.selectedAttendance = null;
    this.markAttendanceForm = {
      employeeId: employee.empId,
      isPresent: true,
      isLate: false,
      checkInTime: '',
      markedByAdminId: this.profile.email
    };
    this.showMarkAttendanceModal = true;
  }

  markAttendance() {
    if (!this.markAttendanceForm.employeeId) return;
    const attendance: Attendance = {
      employeeId: this.markAttendanceForm.employeeId!,
      isPresent: this.markAttendanceForm.isPresent ?? true,
      isLate: this.markAttendanceForm.isLate ?? false,
      checkInTime: this.markAttendanceForm.checkInTime || '',
      markedByAdminId: this.profile.email,
      date: new Date().toISOString().split('T')[0]
    };
    this.attendanceService.markAttendance(attendance).subscribe({
      next: () => {
        this.showMarkAttendanceModal = false;
        this.loadTodayAttendance();
      },
      error: () => {
        // handle error
      }
    });
  }

  openEditAttendanceModal(attendance: Attendance) {
    this.selectedAttendance = attendance;
    this.markAttendanceForm = { ...attendance };
    this.showEditAttendanceModal = true;
  }

  editAttendance() {
    if (!this.selectedAttendance) return;
    const updated: Attendance = {
      ...this.selectedAttendance,
      isPresent: this.markAttendanceForm.isPresent ?? true,
      isLate: this.markAttendanceForm.isLate ?? false,
      checkInTime: this.markAttendanceForm.checkInTime || '',
      markedByAdminId: this.profile.email,
      date: this.selectedAttendance.date
    };
    this.attendanceService.editAttendance(this.selectedAttendance.id!, updated).subscribe({
      next: () => {
        this.showEditAttendanceModal = false;
        this.loadTodayAttendance();
      },
      error: () => {
        // handle error
      }
    });
  }

  markPresent(employee: any) {
    console.log('Mark Present clicked for', employee);
    if (!employee.empId) {
      console.error('No employeeId found for employee:', employee);
      this.toastr.error('Cannot mark attendance: Employee ID missing.');
      return;
    }
    this.isMarkingAttendance[employee.empId] = true;
    const now = new Date();
    const checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const attendance: any = {
      employeeId: employee.empId,
      isPresent: true,
      isLate: false,
      checkInTime: checkInTime,
      markedByAdminId: this.profile.email
    };
    console.log('Sending attendance object:', attendance);
    this.attendanceService.markAttendance(attendance).subscribe({
      next: (res) => {
        console.log('Attendance marked (Present) response:', res);
        this.loadTodayAttendance();
        this.showToast('success', 'Attendance marked successfully!');
        this.isMarkingAttendance[employee.empId] = false;
      },
      error: (err) => {
        console.error('Error marking present:', err);
        this.toastr.error('Failed to mark attendance.');
        this.isMarkingAttendance[employee.empId] = false;
      }
    });
  }

  markAbsent(employee: any) {
    console.log('Mark Absent clicked for', employee);
    if (!employee.empId) {
      console.error('No employeeId found for employee:', employee);
      this.toastr.error('Cannot mark attendance: Employee ID missing.');
      return;
    }
    this.isMarkingAttendance[employee.empId] = true;
    const attendance: any = {
      employeeId: employee.empId,
      isPresent: false,
      isLate: false,
      markedByAdminId: this.profile.email
    };
    console.log('Sending attendance object:', attendance);
    this.attendanceService.markAttendance(attendance).subscribe({
      next: (res) => {
        console.log('Attendance marked (Absent) response:', res);
        this.loadTodayAttendance();
        this.showToast('success', 'Attendance marked successfully!');
        this.isMarkingAttendance[employee.empId] = false;
      },
      error: (err) => {
        console.error('Error marking absent:', err);
        this.toastr.error('Failed to mark attendance.');
        this.isMarkingAttendance[employee.empId] = false;
      }
    });
  }

  markLate(employee: any) {
    this.markAttendanceForm = {
      employeeId: employee.empId,
      isPresent: true,
      isLate: true,
      checkInTime: '',
      markedByAdminId: this.profile.email
    };
    this.isMarkingAttendance[employee.empId] = true;
    const attendance = {
      employeeId: employee.empId,
      isPresent: true,
      isLate: true,
      checkInTime: '',
      markedByAdminId: this.profile.email,
      date: this.attendanceDate
    };
    this.attendanceService.markAttendance(attendance).subscribe({
      next: () => {
        this.isMarkingAttendance[employee.empId] = false;
        this.loadTodayAttendance();
        this.showToast('success', 'Attendance marked successfully!');
      },
      error: () => {
        this.isMarkingAttendance[employee.empId] = false;
      }
    });
  }

  loadTasks(): void {
    // Implement API call to load tasks
    console.log('Tasks loaded');
  }

  loadPerformanceData() {
    this.performanceService.getPerformanceFeed().subscribe(feed => this.performanceFeed = feed);
    this.performanceService.getTopPerformers().subscribe(top => this.topPerformers = top);
    this.performanceService.getNeedsAttention().subscribe(needs => this.needsAttention = needs);
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  applyPerformanceFilters() {
    if (!this.performanceFeed) {
      this.filteredPerformanceFeed = [];
      return;
    }
    this.filteredPerformanceFeed = this.performanceFeed.filter(event => {
      let deptMatch = true;
      let periodMatch = true;
      let typeMatch = true;
      if (this.performanceFilter.department !== 'all') {
        deptMatch = event.department === this.performanceFilter.department;
      }
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
      return deptMatch && periodMatch && typeMatch;
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
    const records = this.filteredPerformanceFeed;
    if (!records || records.length === 0) {
      this.showToast('error', 'No performance events to export.', 'Export');
      return;
    }
    const header = ['Employee', 'Type', 'Description', 'Date', 'Feedback', 'Manager'];
    const rows = records.map(r => [
      r.employeeName,
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
    a.download = 'performance-feed.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    this.showToast('success', 'Performance feed exported to CSV.', 'Export');
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

  applyReportFilters() {
    if (!this.reportData) {
      this.filteredReportData = [];
      return;
    }
    this.filteredReportData = this.reportData.filter(record => {
      let dateMatch = true;
      let deptMatch = true;
      let statusMatch = true;
      if (this.reportFilter.startDate) {
        const recordDate = new Date(record.date || record.startDate || record.paymentDate);
        const start = new Date(this.reportFilter.startDate);
        dateMatch = recordDate >= start;
      }
      if (this.reportFilter.endDate) {
        const recordDate = new Date(record.date || record.endDate || record.paymentDate);
        const end = new Date(this.reportFilter.endDate);
        dateMatch = dateMatch && recordDate <= end;
      }
      if (this.reportFilter.department !== 'all') {
        deptMatch = record.department === this.reportFilter.department || (record.employee && record.employee.department === this.reportFilter.department);
      }
      if (this.reportFilter.status !== 'all') {
        statusMatch = record.status === this.reportFilter.status;
      }
      return dateMatch && deptMatch && statusMatch;
    });
    this.selectedReportRows = [];
    this.allReportSelected = false;
    // Set columns dynamically based on first record
    if (this.filteredReportData.length > 0) {
      this.reportColumns = Object.keys(this.filteredReportData[0]).filter(k => k !== 'id');
    } else {
      this.reportColumns = [];
    }
  }

  clearReportFilters() {
    this.reportFilter = { startDate: '', endDate: '', department: 'all', status: 'all' };
    this.applyReportFilters();
  }

  toggleSelectAllReport(event: any): void {
    if (event.target.checked) {
      this.selectedReportRows = this.filteredReportData.map(r => r.id);
      this.allReportSelected = true;
    } else {
      this.selectedReportRows = [];
      this.allReportSelected = false;
    }
  }

  toggleReportRowSelection(id: string): void {
    const idx = this.selectedReportRows.indexOf(id);
    if (idx > -1) {
      this.selectedReportRows.splice(idx, 1);
    } else {
      this.selectedReportRows.push(id);
    }
    this.allReportSelected = this.selectedReportRows.length === this.filteredReportData.length && this.filteredReportData.length > 0;
  }

  openReportDetailModal(record: any): void {
    this.selectedReportDetail = record;
    this.showReportDetailModal = true;
  }

  closeReportDetailModal(): void {
    this.showReportDetailModal = false;
    this.selectedReportDetail = null;
  }

  startHeroCarousel(): void {
    this.heroCarouselInterval = setInterval(() => {
      this.currentHeroImage = (this.currentHeroImage + 1) % this.heroImages.length;
    }, 2500);
  }

  openPromoteEmployeeModal(): void {
    this.showPromoteEmployeeModal = true;
    this.selectedEmployeeToPromote = null;
    this.promotePosition = '';
  }

  promoteEmployee(): void {
    if (!this.selectedEmployeeToPromote || !this.promotePosition) return;
    const updatedEmployee = { ...this.selectedEmployeeToPromote, position: this.promotePosition };
    this.employeesService.updateEmployee(this.selectedEmployeeToPromote.empId, updatedEmployee).subscribe({
      next: (emp) => {
        this.toasts.push({ type: 'success', message: `${emp.firstName} promoted to ${this.promotePosition}!` });
        this.showPromoteEmployeeModal = false;
        this.employeesService.getAllEmployees().subscribe(e => this.employees = e);
      },
      error: () => {
        this.toasts.push({ type: 'error', message: 'Failed to promote employee.' });
      }
    });
  }

  startCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.carouselInterval = setInterval(() => {
      this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carouselSlides.length;
    }, 5000);
  }

  get adminName(): string {
    return this.profile?.name || 'Admin';
  }

  startOnboardingCarousel(): void {
    if (this.onboardingInterval) {
      clearInterval(this.onboardingInterval);
    }
    this.onboardingInterval = setInterval(() => {
      this.onboardingIndex = (this.onboardingIndex + 1) % this.onboardingSlides.length;
    }, 6000);
  }

  completeOnboardingStep(index: number): void {
    this.onboardingSlides[index].completed = true;
    this.onboardingChecklist[index].completed = true;
    // Optionally, move to next step
    if (index < this.onboardingSlides.length - 1) {
      this.onboardingIndex = index + 1;
    } else {
      // All steps complete, show celebration
      this.showCelebration = true;
    }
  }

  closeWelcomeModal(): void {
    this.showWelcomeModal = false;
  }

  showCelebration = false;

  // --- Onboarding Progress Properties ---
  get completedOnboardingSteps(): number {
    return this.onboardingChecklist?.filter(x => x.completed).length || 0;
  }

  get totalOnboardingSteps(): number {
    return this.onboardingChecklist?.length || 0;
  }

  get onboardingProgressPercent(): number {
    return this.totalOnboardingSteps === 0
      ? 0
      : (this.completedOnboardingSteps / this.totalOnboardingSteps) * 100;
  }

  filterAttendanceTableRows() {
    const search = this.attendanceSearch.trim().toLowerCase();
    if (!search) {
      this.filteredAttendanceTableRows = this.attendanceTableRows;
      return;
    }
    this.filteredAttendanceTableRows = this.attendanceTableRows.filter(row => {
      const name = `${row.employee.firstName} ${row.employee.lastName}`.toLowerCase();
      const id = row.employee.empId.toLowerCase();
      return name.includes(search) || id.includes(search);
    });
  }

  markAllPresent() {
    this.attendanceTableRows.forEach(row => {
      if (!row.attendance || !row.attendance.isPresent) {
        this.markPresent(row.employee);
      }
    });
  }

  markAllAbsent() {
    this.attendanceTableRows.forEach(row => {
      if (!row.attendance || row.attendance.isPresent) {
        this.markAbsent(row.employee);
      }
    });
  }
}
