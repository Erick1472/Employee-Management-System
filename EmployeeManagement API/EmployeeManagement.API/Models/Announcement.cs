using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.API.Models
{
    public class Announcement
    {
        [Key]
        public Guid Id { get; set; }
        public string Author { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime Date { get; set; }
    }
}