using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentController : ControllerBase
    {
        private readonly EmployeeManagementDBContext _dbContext;

        public DepartmentController(EmployeeManagementDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDepartments()
        {
            var departments = await _dbContext.Departments.ToListAsync();

            foreach (var department in departments)
            {
                department.TotalEmployees = await _dbContext.Employees
                    .Where(e => e.Department == department.DepartmentName)
                    .CountAsync();
            }

            return Ok(departments);
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetDepartment([FromRoute] Guid id)
        {
            var department = await _dbContext.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }
            return Ok(department);
        }

        [HttpPost]
        public async Task<IActionResult> AddDepartment([FromBody] Department departmentRequest)
        {
            departmentRequest.Id = Guid.NewGuid();
            _dbContext.Departments.Add(departmentRequest);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDepartment), new { id = departmentRequest.Id }, departmentRequest);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateDepartment([FromRoute] Guid id, [FromBody] Department updateDepartmentRequest)
        {
            var existingDepartment = await _dbContext.Departments.FindAsync(id);
            if (existingDepartment == null)
            {
                return NotFound();
            }

            existingDepartment.DepartmentName = updateDepartmentRequest.DepartmentName;
            existingDepartment.Head = updateDepartmentRequest.Head;
            existingDepartment.TotalEmployees = updateDepartmentRequest.TotalEmployees; // This will likely be calculated, but good to have for initial setup
            existingDepartment.Status = updateDepartmentRequest.Status;

            await _dbContext.SaveChangesAsync();
            return Ok(existingDepartment);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteDepartment([FromRoute] Guid id)
        {
            var department = await _dbContext.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            _dbContext.Departments.Remove(department);
            await _dbContext.SaveChangesAsync();
            return Ok(department);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetTotalDepartmentsCount()
        {
            var count = await _dbContext.Departments.CountAsync();
            return Ok(count);
        }

        [HttpGet("heads-count")]
        public async Task<IActionResult> GetDepartmentHeadsCount()
        {
            var count = await _dbContext.Departments.CountAsync(d => d.Head != null && d.Head != "");
            return Ok(count);
        }
    }
}
