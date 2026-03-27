namespace HorseTraining.Application.DTOs;

public class CreateHorseDto
{
    public string Name { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string Discipline { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
}
