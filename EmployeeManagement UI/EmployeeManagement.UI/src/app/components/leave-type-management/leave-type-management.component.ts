import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveTypesService, LeaveType } from 'src/app/services/leave-types.service';

@Component({
  selector: 'app-leave-type-management',
  templateUrl: './leave-type-management.component.html',
  styleUrls: ['./leave-type-management.component.css']
})
export class LeaveTypeManagementComponent implements OnInit {

  leaveTypes: LeaveType[] = [];
  leaveTypeForm!: FormGroup;
  isEditMode: boolean = false;
  selectedLeaveTypeId: string | null = null;
  showAddForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private leaveTypesService: LeaveTypesService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getAllLeaveTypes();
  }

  initForm(): void {
    this.leaveTypeForm = this.fb.group({
      name: ['', Validators.required],
      maxDays: [null, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.cancelEdit();
    } else {
      this.leaveTypeForm.reset();
      this.isEditMode = false;
      this.selectedLeaveTypeId = null;
    }
  }

  getAllLeaveTypes(): void {
    this.leaveTypesService.getAllLeaveTypes()
      .subscribe({
        next: (leaveTypes) => {
          this.leaveTypes = leaveTypes;
        },
        error: (err: any) => {
          console.error('Error fetching leave types:', err);
          alert('Failed to load leave types.');
        }
      });
  }

  onSubmit(): void {
    if (this.leaveTypeForm.valid) {
      if (this.isEditMode && this.selectedLeaveTypeId) {
        this.updateLeaveType();
      } else {
        this.addLeaveType();
      }
    } else {
      this.leaveTypeForm.markAllAsTouched();
    }
  }

  addLeaveType(): void {
    const newLeaveType: Omit<LeaveType, 'id'> = {
      name: this.leaveTypeForm.value.name,
      maxDays: this.leaveTypeForm.value.maxDays,
      description: this.leaveTypeForm.value.description,
      status: this.leaveTypeForm.value.status
    };

    this.leaveTypesService.addLeaveType(newLeaveType as LeaveType)
      .subscribe({
        next: (res: any) => {
          alert('Leave Type added successfully!');
          this.leaveTypeForm.reset();
          this.getAllLeaveTypes();
          this.showAddForm = false;
        },
        error: (err: any) => {
          console.error('Error adding leave type:', err);
          alert('Failed to add leave type.');
        }
      });
  }

  editLeaveType(leaveType: LeaveType): void {
    this.isEditMode = true;
    this.selectedLeaveTypeId = leaveType.id;
    this.leaveTypeForm.patchValue({
      name: leaveType.name,
      maxDays: leaveType.maxDays,
      description: leaveType.description,
      status: leaveType.status
    });
    this.showAddForm = true;
  }

  updateLeaveType(): void {
    if (this.selectedLeaveTypeId) {
      const updatedLeaveType: LeaveType = {
        id: this.selectedLeaveTypeId,
        name: this.leaveTypeForm.value.name,
        maxDays: this.leaveTypeForm.value.maxDays,
        description: this.leaveTypeForm.value.description,
        status: this.leaveTypeForm.value.status
      };

      this.leaveTypesService.updateLeaveType(this.selectedLeaveTypeId, updatedLeaveType)
        .subscribe({
          next: (res: any) => {
            alert('Leave Type updated successfully!');
            this.cancelEdit();
            this.getAllLeaveTypes();
            this.showAddForm = false;
          },
          error: (err: any) => {
            console.error('Error updating leave type:', err);
            alert('Failed to update leave type.');
          }
        });
    }
  }

  deleteLeaveType(id: string): void {
    if (confirm('Are you sure you want to delete this leave type?')) {
      this.leaveTypesService.deleteLeaveType(id)
        .subscribe({
          next: (res: any) => {
            alert('Leave Type deleted successfully!');
            this.getAllLeaveTypes();
          },
          error: (err: any) => {
            console.error('Error deleting leave type:', err);
            alert('Failed to delete leave type.');
          }
        });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedLeaveTypeId = null;
    this.leaveTypeForm.reset();
    this.showAddForm = false;
  }
}
