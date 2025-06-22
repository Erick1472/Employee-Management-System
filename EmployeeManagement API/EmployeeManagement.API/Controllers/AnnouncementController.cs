using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using EmployeeManagement.API.Hubs;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementController : Controller
    {
        private readonly EmployeeManagementDBContext _dbContext;
        private readonly IHubContext<NotificationHub> _hubContext;

        public AnnouncementController(EmployeeManagementDBContext dbContext, IHubContext<NotificationHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAnnouncements()
        {
            var announcements = await _dbContext.Announcements.ToListAsync();
            return Ok(announcements);
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetAnnouncement([FromRoute] Guid id)
        {
            var announcement = await _dbContext.Announcements.FirstOrDefaultAsync(x => x.Id == id);
            if (announcement == null)
            {
                return NotFound();
            }
            return Ok(announcement);
        }

        [HttpPost]
        public async Task<IActionResult> AddAnnouncement([FromBody] Announcement announcementRequest)
        {
            announcementRequest.Id = Guid.NewGuid();
            announcementRequest.Date = DateTime.UtcNow; // Set date on creation
            await _dbContext.Announcements.AddAsync(announcementRequest);
            await _dbContext.SaveChangesAsync();
            // Broadcast to all clients
            await _hubContext.Clients.All.SendAsync("ReceiveAnnouncement", announcementRequest);
            return Ok(announcementRequest);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateAnnouncement([FromRoute] Guid id, [FromBody] Announcement updateAnnouncementRequest)
        {
            var existingAnnouncement = await _dbContext.Announcements.FindAsync(id);
            if (existingAnnouncement == null)
            {
                return NotFound();
            }

            existingAnnouncement.Title = updateAnnouncementRequest.Title;
            existingAnnouncement.Content = updateAnnouncementRequest.Content;
            existingAnnouncement.Date = updateAnnouncementRequest.Date; // Update Date
            existingAnnouncement.Author = updateAnnouncementRequest.Author; // Update Author

            await _dbContext.SaveChangesAsync();
            return Ok(existingAnnouncement);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteAnnouncement([FromRoute] Guid id)
        {
            var announcement = await _dbContext.Announcements.FindAsync(id);
            if (announcement == null)
            {
                return NotFound();
            }
            _dbContext.Announcements.Remove(announcement);
            await _dbContext.SaveChangesAsync();
            return Ok(announcement);
        }
    }
}