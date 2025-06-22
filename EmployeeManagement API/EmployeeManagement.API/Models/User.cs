using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.API.Models
{
    public class User
    {
        public Guid Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
        
        [Required]
        public string Password { get; set; } = null!;
        
        [Required]
        public string Role { get; set; } = null!; // "admin" or "employee"
    }
} 