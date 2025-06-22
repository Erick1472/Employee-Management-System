using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveRequestController : ControllerBase
    {
        private readonly EmployeeManagementDBContext _dbContext;

        public LeaveRequestController(EmployeeManagementDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLeaveRequests()
        {
            return Ok(await _dbContext.LeaveRequests.Include(lr => lr.Employee).Include(lr => lr.LeaveType).Include(lr => lr.ReplacementEmployee).ToListAsync());
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetLeaveRequest([FromRoute] Guid id)
        {
            var leaveRequest = await _dbContext.LeaveRequests.Include(lr => lr.Employee).Include(lr => lr.LeaveType).Include(lr => lr.ReplacementEmployee).FirstOrDefaultAsync(lr => lr.Id == id);
            if (leaveRequest == null)
            {
                return NotFound();
            }
            return Ok(leaveRequest);
        }

        [HttpPost]
        public async Task<IActionResult> AddLeaveRequest([FromBody] LeaveRequest leaveRequestObj)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            leaveRequestObj.Id = Guid.NewGuid();
            leaveRequestObj.Status = "Pending"; // Default status

            // Validate LeaveTypeId
            var leaveType = await _dbContext.LeaveTypes.FindAsync(leaveRequestObj.LeaveTypeId);
            if (leaveType == null)
            {
                return BadRequest(new { message = "Invalid leave type." });
            }

            // Set ReplacementEmployee if provided
            if (!string.IsNullOrEmpty(leaveRequestObj.ReplacementEmployeeId))
            {
                leaveRequestObj.ReplacementEmployee = await _dbContext.Employees.FirstOrDefaultAsync(e => e.EmpId == leaveRequestObj.ReplacementEmployeeId);
            }
            _dbContext.LeaveRequests.Add(leaveRequestObj);
            await _dbContext.SaveChangesAsync();

            // Fetch the complete leave request with employee and replacement data
            var createdLeaveRequest = await _dbContext.LeaveRequests
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ReplacementEmployee)
                .FirstOrDefaultAsync(lr => lr.Id == leaveRequestObj.Id);

            return CreatedAtAction(nameof(GetLeaveRequest), new { id = leaveRequestObj.Id }, createdLeaveRequest);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateLeaveRequest([FromRoute] Guid id, [FromBody] LeaveRequest updateLeaveRequestObj)
        {
            var existingLeaveRequest = await _dbContext.LeaveRequests.FindAsync(id);
            if (existingLeaveRequest == null)
            {
                return NotFound();
            }

            // Validate LeaveTypeId
            var leaveType = await _dbContext.LeaveTypes.FindAsync(updateLeaveRequestObj.LeaveTypeId);
            if (leaveType == null)
            {
                return BadRequest(new { message = "Invalid leave type." });
            }

            existingLeaveRequest.EmployeeId = updateLeaveRequestObj.EmployeeId;
            existingLeaveRequest.LeaveTypeId = updateLeaveRequestObj.LeaveTypeId;
            existingLeaveRequest.StartDate = updateLeaveRequestObj.StartDate;
            existingLeaveRequest.EndDate = updateLeaveRequestObj.EndDate;
            existingLeaveRequest.Reason = updateLeaveRequestObj.Reason;
            existingLeaveRequest.Status = updateLeaveRequestObj.Status; // Allow status update
            existingLeaveRequest.ReplacementEmployeeId = updateLeaveRequestObj.ReplacementEmployeeId;
            if (!string.IsNullOrEmpty(updateLeaveRequestObj.ReplacementEmployeeId))
            {
                existingLeaveRequest.ReplacementEmployee = await _dbContext.Employees.FirstOrDefaultAsync(e => e.EmpId == updateLeaveRequestObj.ReplacementEmployeeId);
            }

            await _dbContext.SaveChangesAsync();
            return Ok(existingLeaveRequest);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteLeaveRequest([FromRoute] Guid id)
        {
            var leaveRequest = await _dbContext.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
            {
                return NotFound();
            }

            _dbContext.LeaveRequests.Remove(leaveRequest);
            await _dbContext.SaveChangesAsync();
            return Ok(leaveRequest);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetTotalLeaveRequestsCount()
        {
            var count = await _dbContext.LeaveRequests.CountAsync();
            return Ok(count);
        }

        [HttpGet("new-count")]
        public async Task<IActionResult> GetNewLeaveRequestsCount()
        {
            var count = await _dbContext.LeaveRequests.CountAsync(lr => lr.Status == "New");
            return Ok(count);
        }

        [HttpGet("pending-count")]
        public async Task<IActionResult> GetPendingLeaveRequestsCount()
        {
            var count = await _dbContext.LeaveRequests.CountAsync(lr => lr.Status == "Pending");
            return Ok(count);
        }

        [HttpGet]
        [Route("employee/{employeeId}")]
        public async Task<IActionResult> GetLeaveRequestsByEmployeeId([FromRoute] string employeeId)
        {
            // Debug logging
            Console.WriteLine($"[DEBUG] Fetching leave requests for employeeId: {employeeId}");

            var leaveRequests = await _dbContext.LeaveRequests
                .Where(lr => lr.EmployeeId == employeeId)
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ReplacementEmployee)
                .ToListAsync();

            Console.WriteLine($"[DEBUG] Found {leaveRequests.Count} leave requests for employeeId: {employeeId}");
            foreach (var lr in leaveRequests)
            {
                Console.WriteLine($"[DEBUG] LeaveRequest ID: {lr.Id}, Status: {lr.Status}, EmployeeId: {lr.EmployeeId}");
            }

            return Ok(leaveRequests);
        }

        [HttpGet("leave-types")]
        public async Task<IActionResult> GetAllLeaveTypes()
        {
            var leaveTypes = await _dbContext.LeaveTypes.ToListAsync();
            return Ok(leaveTypes);
        }
    }
} 