using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;

namespace EmployeeManagement.API.Scripts
{
    public class UpdateEmployeeFields
    {
        public static async Task Run(string[] args)
        {
            try
            {
                // Build configuration
                var configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .AddJsonFile($"appsettings.Development.json", optional: true)
                    .Build();

                // Get connection string
                var connectionString = configuration.GetConnectionString("EmployeeManagementConnectionString");
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException("Connection string 'EmployeeManagementConnectionString' not found.");
                }

                // Create DbContext options
                var optionsBuilder = new DbContextOptionsBuilder<EmployeeManagement.API.Data.EmployeeManagementDBContext>();
                optionsBuilder.UseSqlServer(connectionString);

                // Create DbContext
                using var context = new EmployeeManagement.API.Data.EmployeeManagementDBContext(optionsBuilder.Options);

                // Update the table to make fields nullable
                var sql = @"
                    ALTER TABLE Employees
                    ALTER COLUMN Country nvarchar(max) NULL;
                    
                    ALTER TABLE Employees
                    ALTER COLUMN State nvarchar(max) NULL;
                    
                    ALTER TABLE Employees
                    ALTER COLUMN City nvarchar(max) NULL;
                    
                    ALTER TABLE Employees
                    ALTER COLUMN DOB datetime2 NULL;
                    
                    ALTER TABLE Employees
                    ALTER COLUMN Photo nvarchar(max) NULL;
                    
                    ALTER TABLE Employees
                    ALTER COLUMN Address nvarchar(max) NULL;";

                await context.Database.ExecuteSqlRawAsync(sql);
                Console.WriteLine("Successfully updated Employee table fields to be nullable.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating Employee table: {ex.Message}");
                throw;
            }
        }
    }
} 