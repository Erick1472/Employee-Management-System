using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : Controller
    {
        private readonly EmployeeManagementDBContext _employeeManagementDBContext;
        public EmployeesController(EmployeeManagementDBContext employeeManagementDBContext)
        {
            _employeeManagementDBContext = employeeManagementDBContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEmployees()
        {
            var employees = await _employeeManagementDBContext.Employees.ToListAsync();
            // EmpId is already string, no need for ToString()
            var formattedEmployees = employees.Select(e => new
            {
                EmpId = e.EmpId,
                e.FirstName,
                e.LastName,
                e.Department,
                e.EmailId,
                e.MobileNo,
                e.DateOfJoining,
                e.Password // Be cautious with sending password in real apps
            });
            return Ok(formattedEmployees);
        }

        [HttpPost]
        public async Task<IActionResult> AddEmployee([FromBody] AddEmployeeRequest employeeRequest)
        {
            try
            {
                // Parse the date string
                if (!DateTime.TryParse(employeeRequest.DateOfJoining, out var parsedDate))
                {
                    return BadRequest(new { message = "Invalid date format for DateOfJoining." });
                }

                // Check if email already exists
                var existingUser = await _employeeManagementDBContext.Users
                    .FirstOrDefaultAsync(u => u.Email == employeeRequest.EmailId);
                
                if (existingUser != null)
                {
                    return BadRequest(new { message = "An employee with this email already exists." });
                }

                var employee = new Employee
                {
                    FirstName = employeeRequest.FirstName,
                    LastName = employeeRequest.LastName,
                    Department = employeeRequest.Department,
                    EmailId = employeeRequest.EmailId,
                    MobileNo = employeeRequest.MobileNo,
                    DateOfJoining = parsedDate,
                    Password = employeeRequest.Password
                };

                // Generate sequential EmpId
                var lastEmployee = await _employeeManagementDBContext.Employees
                                        .OrderByDescending(e => e.EmpId)
                                        .FirstOrDefaultAsync();

                int nextIdNum = 1;
                if (lastEmployee != null && lastEmployee.EmpId != null && lastEmployee.EmpId.StartsWith("Emp") && int.TryParse(lastEmployee.EmpId.Substring(3), out int currentMaxId))
                {
                    nextIdNum = currentMaxId + 1;
                }
                employee.EmpId = $"Emp{nextIdNum:D3}"; // Format as Emp001, Emp002 etc.

                // Add employee
                await _employeeManagementDBContext.Employees.AddAsync(employee);
                await _employeeManagementDBContext.SaveChangesAsync();

                // Create a new user entry for the employee
                var newUser = new User
                {
                    Id = Guid.NewGuid(), // User Id remains Guid
                    Email = employeeRequest.EmailId,
                    Password = employeeRequest.Password!, 
                    Role = "employee"
                };

                await _employeeManagementDBContext.Users.AddAsync(newUser);
                await _employeeManagementDBContext.SaveChangesAsync();

                // Return the newly created employee
                return Ok(new
                {
                    employee.EmpId,
                    employee.FirstName,
                    employee.LastName,
                    employee.Department,
                    employee.EmailId,
                    employee.MobileNo,
                    employee.DateOfJoining
                });
            }
            catch (Exception ex)
            {
                // Recursively get all inner exception messages
                string GetFullExceptionMessage(Exception e)
                {
                    if (e == null) return string.Empty;
                    return e.Message + (e.InnerException != null ? " | Inner: " + GetFullExceptionMessage(e.InnerException) : "");
                }
                string logFilePath = System.IO.Path.Combine(AppContext.BaseDirectory, "backend_error.log");
                string logContent = $"[{DateTime.UtcNow}] Error adding employee: {GetFullExceptionMessage(ex)}\nStack trace: {ex.StackTrace}\n\n";
                System.IO.File.AppendAllText(logFilePath, logContent);

                Console.WriteLine($"Error adding employee: {GetFullExceptionMessage(ex)}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred while adding the employee. Please check backend_error.log for details." });
            }
        }

        [HttpGet]
        [Route("{empId}")] // Change route parameter type to string
        public async Task<IActionResult> GetEmployee([FromRoute] string empId)
        {
            var employee =
                await _employeeManagementDBContext.Employees.FirstOrDefaultAsync(x => x.EmpId == empId);

            if (employee == null)
            {
                return NotFound();
            }
            return Ok(new
            {
                employee.EmpId,
                employee.FirstName,
                employee.LastName,
                employee.Department,
                employee.EmailId,
                employee.MobileNo,
                employee.DateOfJoining,
                employee.Password
            });
        }

        [HttpGet]
        [Route("email/{email}")]
        public async Task<IActionResult> GetEmployeeByEmail([FromRoute] string email)
        {
            var employee = await _employeeManagementDBContext.Employees.FirstOrDefaultAsync(x => x.EmailId == email);

            if (employee == null)
            {
                return NotFound();
            }
            return Ok(new
            {
                employee.EmpId,
                employee.FirstName,
                employee.LastName,
                employee.Department,
                employee.EmailId,
                employee.MobileNo,
                employee.DateOfJoining,
                employee.Password
            });
        }

        // API generate for Update Employee Method()
        [HttpPut]
        [Route("{empId}")] // Change route parameter type to string
        public async Task<IActionResult> UpdateEmployee([FromRoute] string empId, [FromBody] Employee updateEmployeeRequest)
        {
            var employee = await _employeeManagementDBContext.Employees.FirstOrDefaultAsync(x => x.EmpId == empId);
            if (employee == null)
            {
                return NotFound();
            }

            employee.FirstName = updateEmployeeRequest.FirstName;
            employee.LastName = updateEmployeeRequest.LastName;
            employee.Department = updateEmployeeRequest.Department;
            employee.EmailId = updateEmployeeRequest.EmailId;
            employee.MobileNo = updateEmployeeRequest.MobileNo;
            employee.DateOfJoining = updateEmployeeRequest.DateOfJoining;

            // Only update password if a new one is provided
            if (!string.IsNullOrEmpty(updateEmployeeRequest.Password))
            {
                employee.Password = updateEmployeeRequest.Password; // Make sure to hash this in a real app
            }

            await _employeeManagementDBContext.SaveChangesAsync();

            return Ok(new
            {
                employee.EmpId,
                employee.FirstName,
                employee.LastName,
                employee.Department,
                employee.EmailId,
                employee.MobileNo,
                employee.DateOfJoining,
                employee.Password
            });
        }

        [HttpPut]
        [Route("self-update/{empId}")] // Change route parameter type to string
        public async Task<IActionResult> UpdateEmployeeSelfProfile([FromRoute] string empId, [FromBody] Employee updateEmployeeRequest)
        {
            var employee = await _employeeManagementDBContext.Employees.FirstOrDefaultAsync(x => x.EmpId == empId);
            if (employee == null)
            {
                return NotFound();
            }

            employee.MobileNo = updateEmployeeRequest.MobileNo;
            employee.Password = updateEmployeeRequest.Password; // Make sure to hash this in a real app

            await _employeeManagementDBContext.SaveChangesAsync();

            return Ok(new
            {
                employee.EmpId,
                employee.FirstName,
                employee.LastName,
                employee.Department,
                employee.EmailId,
                employee.MobileNo,
                employee.DateOfJoining,
                employee.Password
            });
        }

        [HttpDelete]
        [Route("{empId}")] // Change route parameter type to string
        public async Task<IActionResult> DeleteEmployee([FromRoute] string empId)
        {
            var employee = await _employeeManagementDBContext.Employees.FirstOrDefaultAsync(x => x.EmpId == empId);
            if (employee == null)
            {
                return NotFound();
            }

            // Also delete the associated user account
            var user = await _employeeManagementDBContext.Users.FirstOrDefaultAsync(u => u.Email == employee.EmailId);
            if (user != null)
            {
                _employeeManagementDBContext.Users.Remove(user);
            }

            _employeeManagementDBContext.Employees.Remove(employee);
            await _employeeManagementDBContext.SaveChangesAsync();
            
            return Ok(new
            {
                employee.EmpId,
                employee.FirstName,
                employee.LastName,
                employee.Department,
                employee.EmailId,
                employee.MobileNo,
                employee.DateOfJoining
            });
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetEmployeesCount()
        {
            var count = await _employeeManagementDBContext.Employees.CountAsync();
            return Ok(count);
        }

        [HttpDelete]
        [Route("delete-all")]
        public async Task<IActionResult> DeleteAllEmployees()
        {
            try
            {
                // Get all employees
                var employees = await _employeeManagementDBContext.Employees.ToListAsync();
                
                // Get all associated user emails
                var employeeEmails = employees.Select(e => e.EmailId).ToList();
                
                // Delete all tasks first (to handle foreign key constraints)
                var tasks = await _employeeManagementDBContext.Tasks.ToListAsync();
                _employeeManagementDBContext.Tasks.RemoveRange(tasks);
                
                // Delete associated user accounts
                var users = await _employeeManagementDBContext.Users
                    .Where(u => employeeEmails.Contains(u.Email))
                    .ToListAsync();
                _employeeManagementDBContext.Users.RemoveRange(users);
                
                // Delete all employees
                _employeeManagementDBContext.Employees.RemoveRange(employees);
                
                // Save changes
                await _employeeManagementDBContext.SaveChangesAsync();
                
                return Ok(new { 
                    message = $"Successfully deleted {employees.Count} employees, {users.Count} user accounts, and {tasks.Count} tasks." 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting employees", error = ex.Message });
            }
        }
    }
}
