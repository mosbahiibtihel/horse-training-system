namespace HorseTraining.Domain.Entities;

using HorseTraining.Domain.Enums;

public class Horse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public Discipline Discipline { get; set; }
    public string? PhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public ICollection<TrainingSession> TrainingSessions { get; set; } = new List<TrainingSession>();
}