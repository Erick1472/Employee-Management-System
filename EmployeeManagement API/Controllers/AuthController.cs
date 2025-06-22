using Microsoft.AspNetCore.Mvc;
using EmployeeManagement.API.Services;
using EmployeeManagement.API.Models;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var (success, token, message) = await _authService.AuthenticateAsync(request.Email, request.Password);

            if (!success)
                return Unauthorized(new { message });

            return Ok(new { token, message });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
} 