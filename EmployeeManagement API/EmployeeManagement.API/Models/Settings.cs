using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.API.Models
{
    public class GeneralSettings
    {
        [Key]
        public Guid Id { get; set; }
        public string CompanyName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Theme { get; set; } = null!;
    }

    // DTO for password update request
    public class PasswordUpdateRequest
    {
        [Required]
        public string CurrentPassword { get; set; } = null!;
        [Required]
        public string NewPassword { get; set; } = null!;
        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = null!;
    }
} 