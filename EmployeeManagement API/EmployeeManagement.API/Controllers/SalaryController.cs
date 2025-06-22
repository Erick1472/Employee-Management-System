using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalaryController : ControllerBase
    {
        private readonly EmployeeManagementDBContext _dbContext;

        public SalaryController(EmployeeManagementDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSalaryRecords()
        {
            return Ok(await _dbContext.Salaries.Include(s => s.Employee).ToListAsync());
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetSalaryRecord([FromRoute] Guid id)
        {
            var salaryRecord = await _dbContext.Salaries.Include(s => s.Employee).FirstOrDefaultAsync(s => s.Id == id);
            if (salaryRecord == null)
            {
                return NotFound();
            }
            return Ok(salaryRecord);
        }

        [HttpPost]
        public async Task<IActionResult> AddSalaryRecord([FromBody] Salary salaryRequest)
        {
            // Calculate NetSalary
            salaryRequest.NetSalary = salaryRequest.BasicSalary + salaryRequest.Allowances - salaryRequest.Deductions;
            salaryRequest.Id = Guid.NewGuid();
            _dbContext.Salaries.Add(salaryRequest);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSalaryRecord), new { id = salaryRequest.Id }, salaryRequest);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateSalaryRecord([FromRoute] Guid id, [FromBody] Salary updateSalaryRequest)
        {
            var existingSalaryRecord = await _dbContext.Salaries.FindAsync(id);
            if (existingSalaryRecord == null)
            {
                return NotFound();
            }

            existingSalaryRecord.EmployeeId = updateSalaryRequest.EmployeeId;
            existingSalaryRecord.BasicSalary = updateSalaryRequest.BasicSalary;
            existingSalaryRecord.Allowances = updateSalaryRequest.Allowances;
            existingSalaryRecord.Deductions = updateSalaryRequest.Deductions;
            existingSalaryRecord.NetSalary = updateSalaryRequest.BasicSalary + updateSalaryRequest.Allowances - updateSalaryRequest.Deductions; // Recalculate
            existingSalaryRecord.Month = updateSalaryRequest.Month;
            existingSalaryRecord.PaymentDate = updateSalaryRequest.PaymentDate;

            await _dbContext.SaveChangesAsync();
            return Ok(existingSalaryRecord);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteSalaryRecord([FromRoute] Guid id)
        {
            var salaryRecord = await _dbContext.Salaries.FindAsync(id);
            if (salaryRecord == null)
            {
                return NotFound();
            }

            _dbContext.Salaries.Remove(salaryRecord);
            await _dbContext.SaveChangesAsync();
            return Ok(salaryRecord);
        }
    }
} 