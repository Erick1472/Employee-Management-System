using System.ComponentModel.DataAnnotations;
using System;

namespace EmployeeManagement.API.Models
{
    public class Employee
    {
        [Key]
        public string EmpId { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Department { get; set; } = null!;
        public string EmailId { get; set; } = null!;
        public string MobileNo { get; set; } = null!;
        public DateTime? DateOfJoining { get; set; }
        public string Password { get; set; } = null!;
    }
}
