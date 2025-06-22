using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveTypeController : ControllerBase
    {
        private readonly EmployeeManagementDBContext _dbContext;

        public LeaveTypeController(EmployeeManagementDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLeaveTypes()
        {
            return Ok(await _dbContext.LeaveTypes.ToListAsync());
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetLeaveType([FromRoute] Guid id)
        {
            var leaveType = await _dbContext.LeaveTypes.FindAsync(id);
            if (leaveType == null)
            {
                return NotFound();
            }
            return Ok(leaveType);
        }

        [HttpPost]
        public async Task<IActionResult> AddLeaveType([FromBody] LeaveType leaveTypeRequest)
        {
            leaveTypeRequest.Id = Guid.NewGuid();
            _dbContext.LeaveTypes.Add(leaveTypeRequest);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetLeaveType), new { id = leaveTypeRequest.Id }, leaveTypeRequest);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateLeaveType([FromRoute] Guid id, [FromBody] LeaveType updateLeaveTypeRequest)
        {
            var existingLeaveType = await _dbContext.LeaveTypes.FindAsync(id);
            if (existingLeaveType == null)
            {
                return NotFound();
            }

            existingLeaveType.Name = updateLeaveTypeRequest.Name;
            existingLeaveType.MaxDays = updateLeaveTypeRequest.MaxDays;
            existingLeaveType.Description = updateLeaveTypeRequest.Description;
            existingLeaveType.Status = updateLeaveTypeRequest.Status;

            await _dbContext.SaveChangesAsync();
            return Ok(existingLeaveType);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteLeaveType([FromRoute] Guid id)
        {
            var leaveType = await _dbContext.LeaveTypes.FindAsync(id);
            if (leaveType == null)
            {
                return NotFound();
            }

            _dbContext.LeaveTypes.Remove(leaveType);
            await _dbContext.SaveChangesAsync();
            return Ok(leaveType);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetTotalLeaveTypesCount()
        {
            var count = await _dbContext.LeaveTypes.CountAsync();
            return Ok(count);
        }

        [HttpGet("active-count")]
        public async Task<IActionResult> GetActiveLeaveTypesCount()
        {
            var count = await _dbContext.LeaveTypes.CountAsync(lt => lt.Status == "Active");
            return Ok(count);
        }
    }
} 