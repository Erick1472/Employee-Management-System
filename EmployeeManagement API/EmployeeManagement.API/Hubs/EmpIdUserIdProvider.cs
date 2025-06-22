using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace EmployeeManagement.API.Hubs
{
    public class EmpIdUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            // Try to get the 'empId' claim from the JWT
            return connection.User?.FindFirst("empId")?.Value
                ?? connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? connection.User?.Identity?.Name;
        }
    }
} 