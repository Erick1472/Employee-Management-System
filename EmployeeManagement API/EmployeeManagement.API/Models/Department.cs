namespace EmployeeManagement.API.Models
{
    public class Department
    {
        public Guid Id { get; set; }
        public string DepartmentName { get; set; } = null!;
        public string Head { get; set; } = null!; // Can be a string for employee name or ID
        public int TotalEmployees { get; set; } // Will be calculated in the backend
        public string Status { get; set; } = null!; // e.g., Active, Inactive
    }
} 