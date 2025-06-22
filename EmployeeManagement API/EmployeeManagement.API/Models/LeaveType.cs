namespace EmployeeManagement.API.Models
{
    public class LeaveType
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int MaxDays { get; set; }
        public string Description { get; set; } = null!;
        public string Status { get; set; } = null!; // e.g., Active, Inactive
    }
} 