import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TasksService, Task } from '../../services/tasks.service';
import { Employee } from '../../models/employee.model';
import { EmployeesService } from '../../services/employees.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.css']
})
export class TaskManagementComponent implements OnInit, OnDestroy {
  taskForm: FormGroup;
  tasks: Task[] = [];
  employees: Employee[] = [];
  isEditMode: boolean = false;
  selectedTaskId: string | null = null;
  showTaskModal: boolean = false;
  filteredTasks: Task[] = [];
  filter = { status: '', priority: '', dueDate: '' };
  selectedTasks: string[] = [];
  allSelected: boolean = false;
  showTaskDetailModal: boolean = false;
  selectedTaskDetail: Task | null = null;
  toasts: { header: string, message: string, type: 'success' | 'error' }[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private tasksService: TasksService,
    private employeesService: EmployeesService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedToEmployeeId: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['Low', Validators.required],
      status: ['Pending', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadEmployees();
  }

  openTaskModal(): void {
    this.showTaskModal = true;
      this.isEditMode = false;
      this.selectedTaskId = null;
    this.taskForm.reset();
    this.taskForm.get('priority')?.setValue('Low');
    this.taskForm.get('status')?.setValue('Pending');
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.isEditMode = false;
    this.selectedTaskId = null;
    this.taskForm.reset();
    this.taskForm.get('priority')?.setValue('Low');
    this.taskForm.get('status')?.setValue('Pending');
  }

  loadTasks(): void {
    this.subscriptions.add(this.tasksService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
        this.showToast('Error', 'Failed to load tasks.', 'error');
      }
    }));
  }

  loadEmployees(): void {
    this.subscriptions.add(this.employeesService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        alert('Failed to load employees.');
      }
    }));
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const taskData = { ...this.taskForm.value };
    taskData.dueDate = new Date(taskData.dueDate);

    if (this.isEditMode && this.selectedTaskId) {
      this.subscriptions.add(this.tasksService.updateTask(this.selectedTaskId, taskData).subscribe({
        next: (task) => {
          alert('Task updated successfully!');
          this.closeTaskModal();
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          alert('Failed to update task.');
        }
      }));
    } else {
      const newTaskData = {
        title: taskData.title,
        description: taskData.description,
        assignedToEmployeeId: taskData.assignedToEmployeeId,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status
      };

      this.subscriptions.add(this.tasksService.addTask(newTaskData).subscribe({
        next: (task) => {
          alert('Task added successfully!');
          this.closeTaskModal();
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error adding task:', error);
          alert('Failed to add task.');
        }
      }));
    }
  }

  editTask(task: Task): void {
    this.isEditMode = true;
    this.selectedTaskId = task.id;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      assignedToEmployeeId: task.assignedToEmployeeId,
      dueDate: new Date(task.dueDate).toISOString().substring(0, 10),
      priority: task.priority,
      status: task.status
    });
    this.showTaskModal = true;
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.subscriptions.add(this.tasksService.deleteTask(id).subscribe({
        next: () => {
          alert('Task deleted successfully!');
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          alert('Failed to delete task.');
        }
      }));
    }
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const statusMatch = !this.filter.status || task.status === this.filter.status;
      const priorityMatch = !this.filter.priority || task.priority === this.filter.priority;
      const dueDateMatch = !this.filter.dueDate || (task.dueDate && new Date(task.dueDate).toISOString().substring(0, 10) === this.filter.dueDate);
      return statusMatch && priorityMatch && dueDateMatch;
    });
    this.selectedTasks = [];
    this.allSelected = false;
  }

  clearFilters(): void {
    this.filter = { status: '', priority: '', dueDate: '' };
    this.applyFilters();
  }

  toggleTaskSelection(taskId: string): void {
    const idx = this.selectedTasks.indexOf(taskId);
    if (idx > -1) {
      this.selectedTasks.splice(idx, 1);
    } else {
      this.selectedTasks.push(taskId);
    }
    this.allSelected = this.selectedTasks.length === this.filteredTasks.length && this.filteredTasks.length > 0;
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.selectedTasks = this.filteredTasks.map(t => t.id);
      this.allSelected = true;
    } else {
      this.selectedTasks = [];
      this.allSelected = false;
    }
  }

  bulkComplete(): void {
    if (this.selectedTasks.length === 0) return;
    let completed = 0;
    this.selectedTasks.forEach(taskId => {
      const task = this.tasks.find(t => t.id === taskId);
      if (task && task.status !== 'Completed') {
        this.tasksService.updateTask(taskId, { ...task, status: 'Completed' }).subscribe({
          next: () => {
            completed++;
            if (completed === this.selectedTasks.length) {
              this.showToast('Success', 'Selected tasks marked as completed.', 'success');
              this.loadTasks();
            }
          },
          error: () => {
            this.showToast('Error', 'Failed to mark some tasks as completed.', 'error');
          }
        });
      }
    });
    this.selectedTasks = [];
    this.allSelected = false;
  }

  bulkDelete(): void {
    if (this.selectedTasks.length === 0) return;
    if (!confirm('Are you sure you want to delete the selected tasks?')) return;
    let deleted = 0;
    this.selectedTasks.forEach(taskId => {
      this.tasksService.deleteTask(taskId).subscribe({
        next: () => {
          deleted++;
          if (deleted === this.selectedTasks.length) {
            this.showToast('Success', 'Selected tasks deleted.', 'success');
            this.loadTasks();
          }
        },
        error: () => {
          this.showToast('Error', 'Failed to delete some tasks.', 'error');
        }
      });
    });
    this.selectedTasks = [];
    this.allSelected = false;
  }

  openTaskDetailModal(task: Task): void {
    this.selectedTaskDetail = task;
    this.showTaskDetailModal = true;
  }

  closeTaskDetailModal(): void {
    this.showTaskDetailModal = false;
    this.selectedTaskDetail = null;
  }

  showToast(header: string, message: string, type: 'success' | 'error' = 'success') {
    this.toasts.push({ header, message, type });
    setTimeout(() => {
      this.toasts.shift();
    }, 3500);
  }

  removeToast(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getEmployeeName(employeeId: string): string {
    const employee = this.employees.find(emp => emp.empId === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'N/A';
  }
}
