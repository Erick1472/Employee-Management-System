using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.API.Models
{
    public class Message
    {
        [Key]
        public Guid Id { get; set; }
        public string Sender { get; set; } = null!;
        public string Receiver { get; set; } = null!;
        public string Subject { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime Time { get; set; }
        public bool Read { get; set; }
    }
}