namespace EmployeeManagement.API.Models
{
    using System.Text.Json.Serialization;

    public class Salary
    {
        public Guid Id { get; set; }
        public string EmployeeId { get; set; } = null!; // Foreign key to Employee
        public decimal BasicSalary { get; set; }
        public decimal Allowances { get; set; }
        public decimal Deductions { get; set; }
        public decimal NetSalary { get; set; }
        public string Month { get; set; } = null!;
        public DateTime PaymentDate { get; set; }

        // Navigation property
        [JsonIgnore]
        public Employee? Employee { get; set; }
    }
} 