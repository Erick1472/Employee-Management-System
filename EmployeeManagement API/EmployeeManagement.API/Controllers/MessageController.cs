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
    public class MessageController : Controller
    {
        private readonly EmployeeManagementDBContext _dbContext;
        private readonly IHubContext<NotificationHub> _hubContext;

        public MessageController(EmployeeManagementDBContext dbContext, IHubContext<NotificationHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMessages()
        {
            var messages = await _dbContext.Messages.ToListAsync();
            return Ok(messages);
        }

        [HttpGet]
        [Route("recipient/{email}")]
        public async Task<IActionResult> GetMessagesForRecipient([FromRoute] string email)
        {
            var messages = await _dbContext.Messages.Where(m => m.Receiver == email).ToListAsync();
            if (messages == null || !messages.Any())
            {
                return NotFound();
            }
            return Ok(messages);
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetMessage([FromRoute] Guid id)
        {
            var message = await _dbContext.Messages.FirstOrDefaultAsync(x => x.Id == id);
            if (message == null)
            {
                return NotFound();
            }
            return Ok(message);
        }

        [HttpPost]
        public async Task<IActionResult> AddMessage([FromBody] Message messageRequest)
        {
            messageRequest.Id = Guid.NewGuid();
            messageRequest.Time = DateTime.UtcNow; // Set time on creation
            messageRequest.Read = false; // New messages are unread by default
            await _dbContext.Messages.AddAsync(messageRequest);
            await _dbContext.SaveChangesAsync();
            // Notify the recipient in real time
            await _hubContext.Clients.User(messageRequest.Receiver).SendAsync("ReceiveMessage", messageRequest);
            // If message is recognition/feedback/performance, send performance update
            var subj = messageRequest.Subject.ToLower();
            if (subj.Contains("recognition") || subj.Contains("feedback") || subj.Contains("performance")) {
                await _hubContext.Clients.User(messageRequest.Receiver).SendAsync("PerformanceUpdated", new { message = "Your performance snapshot has been updated!" });
            }
            return Ok(messageRequest);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateMessage([FromRoute] Guid id, [FromBody] Message updateMessageRequest)
        {
            var existingMessage = await _dbContext.Messages.FindAsync(id);
            if (existingMessage == null)
            {
                return NotFound();
            }

            existingMessage.Sender = updateMessageRequest.Sender;
            existingMessage.Receiver = updateMessageRequest.Receiver;
            existingMessage.Subject = updateMessageRequest.Subject; // Update Subject
            existingMessage.Content = updateMessageRequest.Content;
            existingMessage.Read = updateMessageRequest.Read; // Allow updating read status
            // Time should not be updated on edit unless explicitly intended

            await _dbContext.SaveChangesAsync();
            return Ok(existingMessage);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteMessage([FromRoute] Guid id)
        {
            var message = await _dbContext.Messages.FindAsync(id);
            if (message == null)
            {
                return NotFound();
            }
            _dbContext.Messages.Remove(message);
            await _dbContext.SaveChangesAsync();
            return Ok(message);
        }
    }
} 