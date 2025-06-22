using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskModel = EmployeeManagement.API.Models.Task;
using Microsoft.AspNetCore.SignalR;
using EmployeeManagement.API.Hubs;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly EmployeeManagementDBContext _dbContext;
        private readonly IHubContext<NotificationHub> _hubContext;

        public TaskController(EmployeeManagementDBContext dbContext, IHubContext<NotificationHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            return Ok(await _dbContext.Tasks.Include(t => t.AssignedToEmployee).ToListAsync());
        }

        [HttpGet]
        [Route("employee/{employeeId}")]
        public async Task<IActionResult> GetTasksByEmployeeId([FromRoute] string employeeId)
        {
            var tasks = await _dbContext.Tasks.Where(t => t.AssignedToEmployeeId == employeeId).Include(t => t.AssignedToEmployee).ToListAsync();
            if (tasks == null || !tasks.Any())
            {
                return NotFound();
            }
            return Ok(tasks);
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetTask([FromRoute] Guid id)
        {
            var task = await _dbContext.Tasks.Include(t => t.AssignedToEmployee).FirstOrDefaultAsync(t => t.Id == id);
            if (task == null)
            {
                return NotFound();
            }
            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> AddTask([FromBody] TaskModel taskRequest)
        {
            taskRequest.Id = Guid.NewGuid();
            taskRequest.Status = "Pending"; // Default status
            _dbContext.Tasks.Add(taskRequest);
            await _dbContext.SaveChangesAsync();
            // Send real-time notification to assigned employee
            await _hubContext.Clients.User(taskRequest.AssignedToEmployeeId).SendAsync("TaskAssigned", new {
                taskId = taskRequest.Id,
                title = taskRequest.Title,
                message = $"A new task '{taskRequest.Title}' has been assigned to you.",
                dueDate = taskRequest.DueDate
            });
            return CreatedAtAction(nameof(GetTask), new { id = taskRequest.Id }, taskRequest);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateTask([FromRoute] Guid id, [FromBody] TaskModel updateTaskRequest)
        {
            var existingTask = await _dbContext.Tasks.FindAsync(id);
            if (existingTask == null)
            {
                return NotFound();
            }

            bool wasCompleted = existingTask.Status == "Completed";
            existingTask.Title = updateTaskRequest.Title;
            existingTask.Description = updateTaskRequest.Description;
            existingTask.AssignedToEmployeeId = updateTaskRequest.AssignedToEmployeeId;
            existingTask.DueDate = updateTaskRequest.DueDate;
            existingTask.Priority = updateTaskRequest.Priority;
            existingTask.Status = updateTaskRequest.Status; // Allow status update

            await _dbContext.SaveChangesAsync();
            // Send real-time notification to assigned employee
            await _hubContext.Clients.User(existingTask.AssignedToEmployeeId).SendAsync("TaskUpdated", new {
                taskId = existingTask.Id,
                title = existingTask.Title,
                message = $"Your task '{existingTask.Title}' has been updated.",
                dueDate = existingTask.DueDate
            });
            // If task is now completed and wasn't before, send performance update
            if (updateTaskRequest.Status == "Completed" && !wasCompleted) {
                await _hubContext.Clients.User(existingTask.AssignedToEmployeeId).SendAsync("PerformanceUpdated", new { message = "Your performance snapshot has been updated!" });
            }
            return Ok(existingTask);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteTask([FromRoute] Guid id)
        {
            var task = await _dbContext.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            _dbContext.Tasks.Remove(task);
            await _dbContext.SaveChangesAsync();
            // Send real-time notification to assigned employee
            await _hubContext.Clients.User(task.AssignedToEmployeeId).SendAsync("TaskDeleted", new {
                taskId = task.Id,
                title = task.Title,
                message = $"Your task '{task.Title}' has been deleted.",
            });
            return Ok(task);
        }
    }
}