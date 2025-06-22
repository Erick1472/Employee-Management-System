using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using EmployeeManagement.API.Hubs;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, EmpIdUserIdProvider>();

// Dependency Injection / Inject DB Context
var connectionString = builder.Configuration.GetConnectionString("EmployeeManagementConnectionString") ??
                       throw new InvalidOperationException("Connection string 'EmployeeManagementConnectionString' not found.");

builder.Services.AddDbContext<EmployeeManagementDBContext>(options =>
    options.UseSqlServer(connectionString));

// One-off migration script call (commented out after initial execution)
// This line should remain commented out now that data is cleared
// await EmployeeManagement.API.Scripts.MigrateEmployeeIds.Run(args);

var app = builder.Build();

// Create admin user if none exists
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<EmployeeManagementDBContext>();
    
    // Seed Departments
    if (!context.Departments.Any(d => d.DepartmentName == "ICT"))
    {
        context.Departments.Add(new Department
        {
            Id = Guid.NewGuid(),
            DepartmentName = "ICT",
            Head = "Dr Erick",
            TotalEmployees = 0, // Initial count
            Status = "Active"
        });
    }

    if (!context.Departments.Any(d => d.DepartmentName == "Finance"))
    {
        context.Departments.Add(new Department
        {
            Id = Guid.NewGuid(),
            DepartmentName = "Finance",
            Head = "Dr Wanjau",
            TotalEmployees = 0, // Initial count
            Status = "Active"
        });
    }

    // Existing admin user creation logic
    if (!context.Users.Any(u => u.Role == "admin"))
    {
        context.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@company.com",
            Password = "admin123", // In production, this should be hashed
            Role = "admin"
        });
    }
    await context.SaveChangesAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Add global exception handling for production
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

// Enable CORS in API
app.UseCors(policy => 
    policy.AllowAnyHeader()
          .AllowAnyMethod()
          .WithOrigins("http://localhost:4200")
          .AllowCredentials());

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<EmployeeManagement.API.Hubs.NotificationHub>("/notificationHub");
});

app.Run();
