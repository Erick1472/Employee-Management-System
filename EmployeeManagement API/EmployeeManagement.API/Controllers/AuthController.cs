#nullable enable

using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly EmployeeManagementDBContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(EmployeeManagementDBContext context, ILogger<AuthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            _logger.LogInformation("Login attempt for Email: {Email}", request.Email);

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == request.Email &&
                u.Password == request.Password);

            if (user == null)
            {
                _logger.LogWarning("Login failed for Email: {Email} - Invalid credentials.", request.Email);
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Normalize role to lowercase for consistency
            var normalizedRole = user.Role.ToLowerInvariant();

            // Find employee by email to get additional details
            string empId = string.Empty;
            string fullName = "Administrator"; // Default name
            string avatar = "https://icons.iconarchive.com/icons/iconshock/windows-7-general/128/administrator-icon.png"; // Default avatar for admin

            if (normalizedRole == "employee")
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmailId == user.Email);
                if (employee != null)
                {
                    empId = employee.EmpId;
                    fullName = $"{employee.FirstName} {employee.LastName}";
                    // Use a default employee avatar if none is specified in the database
                    avatar = "assets/default-avatar.png";
                }
            }

            // Generate JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("SuperSecretKey@2024!ChangeThis"); // Use a secure key from config in production
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, normalizedRole)
            };
            if (!string.IsNullOrEmpty(empId))
            {
                claims.Add(new Claim("empId", empId));
            }
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);

            _logger.LogInformation("Login successful for Email: {Email}, Role: {Role}", user.Email, normalizedRole);
            return Ok(new { token = jwtToken, user = new { Email = user.Email, Role = normalizedRole, Name = fullName, Avatar = avatar } });
        }

        [HttpPost("migrate-employees")]
        public async Task<IActionResult> MigrateEmployees()
        {
            var employees = await _context.Employees.ToListAsync();
            int migratedCount = 0;

            foreach (var employee in employees)
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == employee.EmailId);
                if (existingUser == null)
                {
                    _context.Users.Add(new User
                    {
                        Id = Guid.NewGuid(),
                        Email = employee.EmailId,
                        Password = employee.Password, // Ensure passwords are hashed in a real application
                        Role = "employee"
                    });
                    migratedCount++;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"{migratedCount} employees migrated to Users table successfully." });
        }
    }

    public class LoginRequest
    {
        [Required]
        public string Email { get; set; } = null!;
        [Required]
        public string Password { get; set; } = null!;
    }
}