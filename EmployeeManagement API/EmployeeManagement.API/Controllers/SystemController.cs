using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemController : ControllerBase
    {
        [HttpGet("backup")]
        public IActionResult DownloadBackup()
        {
            // For demo: return a dummy CSV file. Replace with real backup logic.
            var csv = "Id,Name,Email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com";
            var bytes = Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", "employee-backup.csv");
        }

        [HttpGet("audit-log")]
        public IActionResult DownloadAuditLog()
        {
            // For demo: return a dummy log file. Replace with real audit log logic.
            var log = "2025-06-20 10:00:00,Admin,Login\n2025-06-20 10:05:00,Admin,Added Employee";
            var bytes = Encoding.UTF8.GetBytes(log);
            return File(bytes, "text/plain", "audit-log.txt");
        }
    }
} 