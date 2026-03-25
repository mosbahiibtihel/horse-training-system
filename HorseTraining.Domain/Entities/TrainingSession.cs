namespace HorseTraining.Domain.Entities;

using HorseTraining.Domain.Enums;

public class TrainingSession
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public SessionType SessionType { get; set; }
    public int DurationMinutes { get; set; }
    public int Intensity { get; set; } // 1 to 10
    public string? Notes { get; set; }
    public string? TrainerFeedback { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int HorseId { get; set; }
    public Horse Horse { get; set; } = null!;

    public int RiderId { get; set; }
    public User Rider { get; set; } = null!;
}