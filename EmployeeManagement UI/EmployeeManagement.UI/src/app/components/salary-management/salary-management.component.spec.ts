import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryManagementComponent } from './salary-management.component';

describe('SalaryManagementComponent', () => {
  let component: SalaryManagementComponent;
  let fixture: ComponentFixture<SalaryManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
