using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;

namespace EmployeeManagement.API.Models
{
    public class Task
    {
        [Key]
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string AssignedToEmployeeId { get; set; } = null!;
        public Employee? AssignedToEmployee { get; set; }
        public DateTime DueDate { get; set; }
        public string Priority { get; set; } = null!;
        public string Status { get; set; } = null!;
    }
}