using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace EmployeeManagement.API.Models
{
    public class LeaveRequest
    {
        public Guid Id { get; set; }
        public string EmployeeId { get; set; } = null!;
        public Guid LeaveTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; } = null!;
        public string Status { get; set; } = "Pending"; // e.g., Pending, Approved, Rejected
        public string? ReplacementEmployeeId { get; set; }

        // Navigation properties
        [ValidateNever]
        public Employee Employee { get; set; } = null!;
        [ValidateNever]
        public LeaveType LeaveType { get; set; } = null!;
        [ValidateNever]
        public Employee ReplacementEmployee { get; set; } = null!;
    }
} 