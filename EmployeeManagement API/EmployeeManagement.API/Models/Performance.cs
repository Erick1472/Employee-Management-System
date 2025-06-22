using System;
using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.API.Models
{
    public class DepartmentPerformance
    {
        [Key]
        public Guid Id { get; set; }
        public string DepartmentName { get; set; } = null!;
        public int Score { get; set; }
        public int EmployeeCount { get; set; }
    }

    public class EmployeePerformance
    {
        [Key]
        public Guid Id { get; set; }
        public string EmployeeId { get; set; } = null!;
        public string EmployeeName { get; set; } = null!;
        public int Score { get; set; }
        public string Department { get; set; } = null!;
        public int OverallRating { get; set; }
        public string? Kpi1 { get; set; }
        public string? Kpi2 { get; set; }
    }

    public class TopPerformer
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Department { get; set; } = null!;
        public string Position { get; set; } = null!;
        public int Score { get; set; }
    }
} 