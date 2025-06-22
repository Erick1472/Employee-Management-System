import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRequestManagementComponent } from './leave-request-management.component';

describe('LeaveRequestManagementComponent', () => {
  let component: LeaveRequestManagementComponent;
  let fixture: ComponentFixture<LeaveRequestManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveRequestManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveRequestManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
