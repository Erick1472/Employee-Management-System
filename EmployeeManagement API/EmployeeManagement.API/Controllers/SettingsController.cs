using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : Controller
    {
        private readonly EmployeeManagementDBContext _dbContext;

        public SettingsController(EmployeeManagementDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("general")]
        public async Task<IActionResult> GetGeneralSettings()
        {
            var settings = await _dbContext.GeneralSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                // Initialize with default settings if none exist
                settings = new GeneralSettings
                {
                    Id = Guid.NewGuid(),
                    CompanyName = "Your Company",
                    Email = "info@yourcompany.com",
                    Theme = "light"
                };
                await _dbContext.GeneralSettings.AddAsync(settings);
                await _dbContext.SaveChangesAsync();
            }
            return Ok(settings);
        }

        [HttpPut("general")]
        public async Task<IActionResult> UpdateGeneralSettings([FromBody] GeneralSettings updatedSettings)
        {
            var existingSettings = await _dbContext.GeneralSettings.FirstOrDefaultAsync();
            if (existingSettings == null)
            {
                return NotFound("General settings not found.");
            }

            existingSettings.CompanyName = updatedSettings.CompanyName;
            existingSettings.Email = updatedSettings.Email;
            existingSettings.Theme = updatedSettings.Theme;

            await _dbContext.SaveChangesAsync();
            return Ok(existingSettings);
        }

        [HttpPut("security/password")]
        public async Task<IActionResult> UpdatePassword([FromBody] PasswordUpdateRequest request)
        {
            // This is a simplified example. In a real app, you'd:            
            // 1. Get the current user's ID from authentication context.
            // 2. Retrieve the user from the database.
            // 3. Verify the current password (hash comparison).
            // 4. Hash the new password.
            // 5. Update the user's password in the database.

            // For demonstration, let's assume we're updating a fixed admin user's password
            var adminUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Role == "admin");
            if (adminUser == null)
            {
                return NotFound("Admin user not found.");
            }

            // Simplified password validation (in real app, use password hashing library like BCrypt)
            if (adminUser.Password != request.CurrentPassword) // Mismatched current password
            {
                return BadRequest("Invalid current password.");
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest("New password and confirm password do not match.");
            }

            adminUser.Password = request.NewPassword; // In real app, hash this
            await _dbContext.SaveChangesAsync();

            return Ok("Password updated successfully.");
        }
    }
} 