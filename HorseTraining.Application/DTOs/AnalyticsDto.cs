namespace HorseTraining.Application.DTOs;

public class DashboardAnalyticsDto
{
    public int TotalHorses { get; set; }
    public int TotalSessions { get; set; }
    public int SessionsThisWeek { get; set; }
    public double AverageIntensity { get; set; }
    public List<WeeklySessionDto> WeeklySessions { get; set; } = new();
    public List<SessionTypeBreakdownDto> SessionTypeBreakdown { get; set; } = new();
    public List<IntensityTrendDto> IntensityTrend { get; set; } = new();
    public List<HorseFitnessDto> HorseFitnessScores { get; set; } = new();
    public List<RecommendationDto> Recommendations { get; set; } = new();
}

public class WeeklySessionDto
{
    public string Week { get; set; } = string.Empty;
    public int Count { get; set; }
    public int TotalMinutes { get; set; }
}

public class SessionTypeBreakdownDto
{
    public string SessionType { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class IntensityTrendDto
{
    public string Date { get; set; } = string.Empty;
    public double AverageIntensity { get; set; }
}

public class HorseFitnessDto
{
    public int HorseId { get; set; }
    public string HorseName { get; set; } = string.Empty;
    public int FitnessScore { get; set; }
    public int SessionCount { get; set; }
    public double AverageIntensity { get; set; }
}

public class RecommendationDto
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string HorseName { get; set; } = string.Empty;
}

