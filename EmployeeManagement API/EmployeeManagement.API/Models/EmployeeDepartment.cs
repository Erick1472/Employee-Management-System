using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagement.API.Models
{
    public class EmployeeDepartment
    {
        public string EmployeeId { get; set; } = null!;
        public Employee Employee { get; set; } = null!;

        public Guid DepartmentId { get; set; }
        public Department Department { get; set; } = null!;
    }
} 