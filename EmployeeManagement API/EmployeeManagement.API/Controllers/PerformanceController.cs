using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerformanceController : ControllerBase
    {
        private readonly EmployeeManagementDBContext _db;

        public PerformanceController(EmployeeManagementDBContext db)
        {
            _db = db;
        }

        // Unified event model for frontend
        public class PerformanceEvent
        {
            public string EmployeeId { get; set; }
            public string EmployeeName { get; set; }
            public string Type { get; set; } // e.g., TaskCompleted, Late, Recognition
            public string Description { get; set; }
            public DateTime Date { get; set; }
            public string Icon { get; set; }
            public string BadgeColor { get; set; }
        }

        [HttpGet("feed")]
        public async Task<IActionResult> GetPerformanceFeed()
        {
            var events = await AggregatePerformanceEvents();
            return Ok(events.OrderByDescending(e => e.Date));
        }

        [HttpGet("top-performers")]
        public async Task<IActionResult> GetTopPerformers()
        {
            var events = await AggregatePerformanceEvents();
            // Simple logic: most TaskCompleted + best attendance
            var top = events.Where(e => e.Type == "TaskCompleted" || e.Type == "Present")
                .GroupBy(e => new { e.EmployeeId, e.EmployeeName })
                .Select(g => new {
                    g.Key.EmployeeId,
                    g.Key.EmployeeName,
                    Score = g.Count(),
                    LastEvent = g.Max(x => x.Date)
                })
                .OrderByDescending(x => x.Score)
                .Take(5)
                .ToList();
            return Ok(top);
        }

        [HttpGet("needs-attention")]
        public async Task<IActionResult> GetNeedsAttention()
        {
            var events = await AggregatePerformanceEvents();
            // Simple logic: most Late/Absent events
            var needs = events.Where(e => e.Type == "Late" || e.Type == "Absent")
                .GroupBy(e => new { e.EmployeeId, e.EmployeeName })
                .Select(g => new {
                    g.Key.EmployeeId,
                    g.Key.EmployeeName,
                    Issues = g.Count(),
                    LastEvent = g.Max(x => x.Date)
                })
                .OrderByDescending(x => x.Issues)
                .Take(5)
                .ToList();
            return Ok(needs);
        }

        [HttpGet("employee/{empId}/snapshot")]
        public async Task<IActionResult> GetEmployeeSnapshot([FromRoute] string empId)
        {
            var events = await AggregatePerformanceEvents(empId);
            var attendance = events.Count(e => e.Type == "Present");
            var late = events.Count(e => e.Type == "Late");
            var absent = events.Count(e => e.Type == "Absent");
            var tasksCompleted = events.Count(e => e.Type == "TaskCompleted");
            var recognitions = events.Count(e => e.Type == "Recognition");
            var feedbacks = events.Where(e => e.Type == "Recognition").Select(e => e.Description).Take(3).ToList();
            var totalAttendance = attendance + late + absent;
            var attendancePct = totalAttendance > 0 ? (int)Math.Round(100.0 * (attendance + late) / totalAttendance) : 0;
            return Ok(new {
                attendance = attendancePct,
                tasksCompleted,
                recognitions,
                late,
                absent,
                recentFeedback = feedbacks
            });
        }

        [HttpGet("employee/{empId}/timeline")]
        public async Task<IActionResult> GetEmployeeTimeline([FromRoute] string empId)
        {
            var events = await AggregatePerformanceEvents(empId);
            return Ok(events.OrderByDescending(e => e.Date));
        }

        // Helper: Aggregate events for all or one employee
        private async Task<List<PerformanceEvent>> AggregatePerformanceEvents(string empId = null)
        {
            var events = new List<PerformanceEvent>();
            var employees = await _db.Employees.ToListAsync();

            // Attendance
            var attendance = await _db.Attendance.Include(a => a.EmployeeId).ToListAsync();
            foreach (var a in attendance)
            {
                if (empId != null && a.EmployeeId != empId) continue;
                var emp = employees.FirstOrDefault(e => e.EmpId == a.EmployeeId);
                if (emp == null) continue;
                events.Add(new PerformanceEvent
                {
                    EmployeeId = a.EmployeeId,
                    EmployeeName = emp.FirstName + " " + emp.LastName,
                    Type = a.IsPresent ? (a.IsLate ? "Late" : "Present") : "Absent",
                    Description = a.IsPresent ? (a.IsLate ? "Late arrival" : "Present") : "Absent",
                    Date = a.Date,
                    Icon = a.IsPresent ? (a.IsLate ? "clock" : "check") : "times",
                    BadgeColor = a.IsPresent ? (a.IsLate ? "warning" : "success") : "danger"
                });
            }

            // Tasks
            var tasks = await _db.Tasks.Include(t => t.AssignedToEmployee).ToListAsync();
            foreach (var t in tasks)
            {
                if (empId != null && t.AssignedToEmployeeId != empId) continue;
                var emp = employees.FirstOrDefault(e => e.EmpId == t.AssignedToEmployeeId);
                if (emp == null) continue;
                if (t.Status == "Completed")
                {
                    events.Add(new PerformanceEvent
                    {
                        EmployeeId = t.AssignedToEmployeeId,
                        EmployeeName = emp.FirstName + " " + emp.LastName,
                        Type = "TaskCompleted",
                        Description = $"Completed task '{t.Title}'",
                        Date = t.DueDate,
                        Icon = "check-circle",
                        BadgeColor = "success"
                    });
                }
                // Add more logic for missed deadlines, etc.
            }

            // Recognitions/Feedback (from Messages)
            var recognitions = await _db.Messages.ToListAsync();
            foreach (var m in recognitions)
            {
                if (empId != null && m.Receiver != empId && m.Sender != empId) continue;
                var emp = employees.FirstOrDefault(e => e.EmailId == m.Receiver);
                if (emp == null) continue;
                if (m.Subject.ToLower().Contains("recognition") || m.Subject.ToLower().Contains("feedback") || m.Subject.ToLower().Contains("performance"))
                {
                    events.Add(new PerformanceEvent
                    {
                        EmployeeId = emp.EmpId,
                        EmployeeName = emp.FirstName + " " + emp.LastName,
                        Type = "Recognition",
                        Description = $"{m.Subject}: {m.Content}",
                        Date = m.Time,
                        Icon = "star",
                        BadgeColor = "info"
                    });
                }
            }

            return events;
        }
    }
} 