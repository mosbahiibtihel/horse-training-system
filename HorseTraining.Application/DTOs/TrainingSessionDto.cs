// File: HorseTraining.Application/DTOs/TrainingSessionDto.cs
namespace HorseTraining.Application.DTOs;

public class TrainingSessionDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string SessionType { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public string Intensity { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? TrainerFeedback { get; set; }
    public DateTime CreatedAt { get; set; }
    public int HorseId { get; set; }
    public string HorseName { get; set; } = string.Empty;
    public int RiderId { get; set; }
    public string RiderName { get; set; } = string.Empty;
    public bool HasFeedback { get; set; }
}

public class CreateTrainingSessionDto
{
    public DateTime Date { get; set; }
    public string SessionType { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public string Intensity { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public int HorseId { get; set; }
}

public class UpdateTrainingSessionDto
{
    public DateTime Date { get; set; }
    public string SessionType { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public string Intensity { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? TrainerFeedback { get; set; }
}

public class AddTrainerFeedbackDto
{
    public string TrainerFeedback { get; set; } = string.Empty;
}