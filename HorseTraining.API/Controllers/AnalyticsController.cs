namespace HorseTraining.API.Controllers;

using HorseTraining.Application.DTOs;
using HorseTraining.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalyticsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        var now = DateTime.UtcNow;
        var weekStart = now.AddDays(-(int)now.DayOfWeek);

        // Base query — riders see only their data
        var sessionsQuery = _context.TrainingSessions
            .Include(s => s.Horse)
            .AsQueryable();

        if (userRole == "Rider")
            sessionsQuery = sessionsQuery.Where(s => s.RiderId == userId);

        var sessions = await sessionsQuery.ToListAsync();

        var horsesQuery = _context.Horses.AsQueryable();
        if (userRole == "Rider")
            horsesQuery = horsesQuery.Where(h => h.OwnerId == userId);

        var horses = await horsesQuery.ToListAsync();

        // Weekly sessions — last 6 weeks
        var weeklySessions = Enumerable.Range(0, 6)
            .Select(i =>
            {
                var start = weekStart.AddDays(-7 * (5 - i));
                var end = start.AddDays(7);
                var weekSessions = sessions
                    .Where(s => s.Date >= start && s.Date < end)
                    .ToList();
                return new WeeklySessionDto
                {
                    Week = start.ToString("MMM dd"),
                    Count = weekSessions.Count,
                    TotalMinutes = weekSessions.Sum(s => s.DurationMinutes)
                };
            }).ToList();

        // Session type breakdown
        var typeBreakdown = sessions
            .GroupBy(s => s.SessionType.ToString())
            .Select(g => new SessionTypeBreakdownDto
            {
                SessionType = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        // Intensity trend — last 14 days
        var intensityTrend = Enumerable.Range(0, 14)
            .Select(i =>
            {
                var date = now.AddDays(-13 + i).Date;
                var daySessions = sessions
                    .Where(s => s.Date.Date == date)
                    .ToList();
                return new IntensityTrendDto
                {
                    Date = date.ToString("MMM dd"),
                    AverageIntensity = daySessions.Any()
                        ? Math.Round(daySessions.Average(s => s.Intensity), 1)
                        : 0
                };
            }).ToList();

        // Horse fitness scores (rule-based)
        var horseFitness = horses.Select(horse =>
        {
            var horseSessions = sessions
                .Where(s => s.HorseId == horse.Id)
                .ToList();

            var recentSessions = horseSessions
                .Where(s => s.Date >= now.AddDays(-30))
                .ToList();

            // Fitness formula:
            // frequency score (0-40): sessions per month, max 12
            // intensity score (0-30): average intensity normalized
            // consistency score (0-30): sessions spread across weeks

            var frequencyScore = Math.Min(40,
                (int)(recentSessions.Count / 12.0 * 40));

            var avgIntensity = recentSessions.Any()
                ? recentSessions.Average(s => s.Intensity) : 0;
            var intensityScore = (int)(avgIntensity / 10.0 * 30);

            var weeksActive = recentSessions
                .Select(s => (int)(s.Date - now.AddDays(-30))
                    .TotalDays / 7)
                .Distinct().Count();
            var consistencyScore = Math.Min(30,
                (int)(weeksActive / 4.0 * 30));

            var total = frequencyScore + intensityScore + consistencyScore;

            return new HorseFitnessDto
            {
                HorseId = horse.Id,
                HorseName = horse.Name,
                FitnessScore = total,
                SessionCount = recentSessions.Count,
                AverageIntensity = Math.Round(avgIntensity, 1)
            };
        }).ToList();

        // Smart recommendations (rule-based engine)
        var recommendations = new List<RecommendationDto>();

        foreach (var horse in horses)
        {
            var horseSessions = sessions
                .Where(s => s.HorseId == horse.Id)
                .OrderByDescending(s => s.Date)
                .ToList();

            var thisWeek = horseSessions
                .Where(s => s.Date >= weekStart).ToList();
            var lastWeek = horseSessions
                .Where(s => s.Date >= weekStart.AddDays(-7)
                    && s.Date < weekStart).ToList();

            // Overtraining detection
            if (thisWeek.Count >= 2 && lastWeek.Count >= 2)
            {
                var thisAvg = thisWeek.Average(s => s.Intensity);
                var lastAvg = lastWeek.Average(s => s.Intensity);
                if (thisAvg > lastAvg * 1.3)
                {
                    recommendations.Add(new RecommendationDto
                    {
                        Type = "warning",
                        HorseName = horse.Name,
                        Message = $"{horse.Name}'s training intensity increased " +
                            $"by {(int)((thisAvg / lastAvg - 1) * 100)}% this week. " +
                            $"Consider scheduling a recovery session."
                    });
                }
            }

            // No recent sessions
            if (horseSessions.Any())
            {
                var daysSinceLast = (now - horseSessions.First().Date).TotalDays;
                if (daysSinceLast > 7)
                {
                    recommendations.Add(new RecommendationDto
                    {
                        Type = "info",
                        HorseName = horse.Name,
                        Message = $"{horse.Name} hasn't trained in " +
                            $"{(int)daysSinceLast} days. " +
                            $"Time to schedule a session."
                    });
                }
            }

            // Low intensity suggestion
            if (thisWeek.Count >= 3)
            {
                var avgIntensity = thisWeek.Average(s => s.Intensity);
                if (avgIntensity < 4)
                {
                    recommendations.Add(new RecommendationDto
                    {
                        Type = "info",
                        HorseName = horse.Name,
                        Message = $"{horse.Name}'s sessions this week are " +
                            $"averaging low intensity ({avgIntensity:F1}/10). " +
                            $"Consider increasing training load."
                    });
                }
            }
        }

        return Ok(new DashboardAnalyticsDto
        {
            TotalHorses = horses.Count,
            TotalSessions = sessions.Count,
            SessionsThisWeek = sessions
                .Count(s => s.Date >= weekStart),
            AverageIntensity = sessions.Any()
                ? Math.Round(sessions.Average(s => s.Intensity), 1) : 0,
            WeeklySessions = weeklySessions,
            SessionTypeBreakdown = typeBreakdown,
            IntensityTrend = intensityTrend,
            HorseFitnessScores = horseFitness,
            Recommendations = recommendations
        });
    }
}