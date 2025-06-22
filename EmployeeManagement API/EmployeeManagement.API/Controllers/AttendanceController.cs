using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using EmployeeManagement.API.Hubs;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly EmployeeManagementDBContext _dbContext;
        private readonly IHubContext<NotificationHub> _hubContext;
        public AttendanceController(EmployeeManagementDBContext dbContext, IHubContext<NotificationHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        // Get attendance log for an employee
        [HttpGet("employee/{empId}")]
        public async Task<IActionResult> GetAttendanceByEmployeeId([FromRoute] string empId)
        {
            var attendance = await _dbContext.Attendance
                .Where(a => a.EmployeeId == empId)
                .OrderByDescending(a => a.Date)
                .ToListAsync();
            return Ok(attendance);
        }

        // Get all employees' attendance for today
        [HttpGet("today")]
        public async Task<IActionResult> GetTodayAttendance()
        {
            var today = DateTime.UtcNow.Date;
            var attendance = await _dbContext.Attendance
                .Where(a => a.Date == today)
                .ToListAsync();
            return Ok(attendance);
        }

        // Admin marks attendance for an employee
        [HttpPost("mark")]
        public async Task<IActionResult> MarkAttendance([FromBody] Attendance attendanceRequest)
        {
            // Check if already marked for today
            var today = DateTime.UtcNow.Date;
            var existing = await _dbContext.Attendance.FirstOrDefaultAsync(a => a.EmployeeId == attendanceRequest.EmployeeId && a.Date == today);
            if (existing != null)
            {
                return BadRequest(new { message = "Attendance already marked for today." });
            }
            attendanceRequest.Id = Guid.NewGuid();
            attendanceRequest.Date = today;
            _dbContext.Attendance.Add(attendanceRequest);
            await _dbContext.SaveChangesAsync();
            // Notify employee of performance update
            await _hubContext.Clients.User(attendanceRequest.EmployeeId).SendAsync("PerformanceUpdated", new { message = "Your performance snapshot has been updated!" });
            return Ok(attendanceRequest);
        }

        // Admin edits an attendance record
        [HttpPut("{id:Guid}")]
        public async Task<IActionResult> EditAttendance([FromRoute] Guid id, [FromBody] Attendance updateRequest)
        {
            var attendance = await _dbContext.Attendance.FindAsync(id);
            if (attendance == null)
            {
                return NotFound();
            }
            attendance.IsPresent = updateRequest.IsPresent;
            attendance.IsLate = updateRequest.IsLate;
            attendance.CheckInTime = updateRequest.CheckInTime;
            attendance.MarkedByAdminId = updateRequest.MarkedByAdminId;
            await _dbContext.SaveChangesAsync();
            return Ok(attendance);
        }

        // Get attendance log for a specific date
        [HttpGet("date/{date}")]
        public async Task<IActionResult> GetAttendanceByDate([FromRoute] string date)
        {
            if (!DateTime.TryParse(date, out var parsedDate))
            {
                return BadRequest(new { message = "Invalid date format. Use yyyy-MM-dd." });
            }
            var attendance = await _dbContext.Attendance
                .Where(a => a.Date == parsedDate.Date)
                .ToListAsync();
            return Ok(attendance);
        }
    }
} 