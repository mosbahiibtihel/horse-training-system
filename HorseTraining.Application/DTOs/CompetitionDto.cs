namespace HorseTraining.Application.DTOs;

public class CompetitionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ResultCount { get; set; }
    public List<CompetitionResultDto> Results { get; set; } = new();
}

public class CreateCompetitionDto
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CompetitionResultDto
{
    public int Id { get; set; }
    public int Ranking { get; set; }
    public double? JumpHeight { get; set; }
    public double? Time { get; set; }
    public string? Notes { get; set; }
    public string HorseName { get; set; } = string.Empty;
    public string RiderName { get; set; } = string.Empty;
    public int HorseId { get; set; }
}

public class CreateCompetitionResultDto
{
    public int HorseId { get; set; }
    public int RiderId { get; set; }
    public int Ranking { get; set; }
    public double? JumpHeight { get; set; }
    public double? Time { get; set; }
    public string? Notes { get; set; }
}
