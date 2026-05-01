namespace HorseTraining.Domain.Entities;

public class CompetitionResult
{
    public int Id { get; set; }
    public int Ranking { get; set; }
    public double? JumpHeight { get; set; }
    public double? Time { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int CompetitionId { get; set; }
    public Competition Competition { get; set; } = null!;

    public int HorseId { get; set; }
    public Horse Horse { get; set; } = null!;

    public int RiderId { get; set; }
    public User Rider { get; set; } = null!;
}