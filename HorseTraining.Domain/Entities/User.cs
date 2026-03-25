namespace HorseTraining.Domain.Entities;

using HorseTraining.Domain.Enums;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Horse> Horses { get; set; } = new List<Horse>();
    public ICollection<TrainingSession> TrainingSessions { get; set; } = new List<TrainingSession>();
}