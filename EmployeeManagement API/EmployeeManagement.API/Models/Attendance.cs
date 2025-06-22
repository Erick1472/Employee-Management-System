using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EmployeeManagement.API.Models
{
    public class Attendance
    {
        [Key]
        public Guid Id { get; set; }
        public string EmployeeId { get; set; } = null!;
        public DateTime Date { get; set; }
        public bool IsPresent { get; set; }
        public bool IsLate { get; set; }
        [JsonConverter(typeof(TimeSpanToStringConverter))]
        public TimeSpan? CheckInTime { get; set; }
        public string MarkedByAdminId { get; set; } = null!; // Admin who marked attendance
    }
} 