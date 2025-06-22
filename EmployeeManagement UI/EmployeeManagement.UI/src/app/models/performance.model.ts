export interface DepartmentPerformance {
  departmentName: string;
  score: number;
  employeeCount: number;
}

export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  score: number;
  department: string;
}

export interface TopPerformer {
  name: string;
  department: string;
  position: string;
  score: number;
  lastEvent?: Date;
} 