using System;

namespace EmployeeManagement.API.Models
{
    public class AddEmployeeRequest
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Department { get; set; } = null!;
        public string EmailId { get; set; } = null!;
        public string MobileNo { get; set; } = null!;
        public string DateOfJoining { get; set; } = null!; // Accept as string
        public string Password { get; set; } = null!;
    }
} 