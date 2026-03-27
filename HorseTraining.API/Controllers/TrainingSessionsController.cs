// File: HorseTraining.API/Controllers/TrainingSessionsController.cs
using HorseTraining.Application.DTOs;
using HorseTraining.Domain.Entities;
using HorseTraining.Domain.Enums;
using HorseTraining.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HorseTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrainingSessionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TrainingSessionsController(AppDbContext context)
    {
        _context = context;
    }

    // Get all training sessions (with filters)
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? horseId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        var query = _context.TrainingSessions
            .Include(ts => ts.Horse)
            .Include(ts => ts.Rider)
            .AsQueryable();

        // Role-based filtering
        if (userRole == "Rider")
        {
            // Riders see only their own sessions
            query = query.Where(ts => ts.RiderId == userId);
        }
        else if (userRole == "Trainer")
        {
            // Trainers see sessions for horses they train
            // This assumes Trainer has a relationship with Horses
            // For now, let trainers see all sessions (adjust as needed)
        }
        // Stable Managers see all

        // Apply filters
        if (horseId.HasValue)
            query = query.Where(ts => ts.HorseId == horseId.Value);

        if (fromDate.HasValue)
            query = query.Where(ts => ts.Date >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(ts => ts.Date <= toDate.Value);

        var sessions = await query
            .OrderByDescending(ts => ts.Date)
            .Select(ts => new TrainingSessionDto
            {
                Id = ts.Id,
                Date = ts.Date,
                SessionType = ts.SessionType.ToString(),
                DurationMinutes = ts.DurationMinutes,
                Intensity = ts.Intensity.ToString(),
                Notes = ts.Notes,
                TrainerFeedback = ts.TrainerFeedback,
                CreatedAt = ts.CreatedAt,
                HorseId = ts.HorseId,
                HorseName = ts.Horse.Name,
                RiderId = ts.RiderId,
                RiderName = ts.Rider.FullName,
                HasFeedback = !string.IsNullOrEmpty(ts.TrainerFeedback)
            })
            .ToListAsync();

        return Ok(sessions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var session = await _context.TrainingSessions
            .Include(ts => ts.Horse)
            .Include(ts => ts.Rider)
            .FirstOrDefaultAsync(ts => ts.Id == id);

        if (session == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        // Check permissions
        if (userRole == "Rider" && session.RiderId != userId)
            return Forbid();

        return Ok(new TrainingSessionDto
        {
            Id = session.Id,
            Date = session.Date,
            SessionType = session.SessionType.ToString(),
            DurationMinutes = session.DurationMinutes,
            Intensity = session.Intensity.ToString(),
            Notes = session.Notes,
            TrainerFeedback = session.TrainerFeedback,
            CreatedAt = session.CreatedAt,
            HorseId = session.HorseId,
            HorseName = session.Horse.Name,
            RiderId = session.RiderId,
            RiderName = session.Rider.FullName,
            HasFeedback = !string.IsNullOrEmpty(session.TrainerFeedback)
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTrainingSessionDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        // Only Riders can create sessions
        if (userRole != "Rider")
            return Forbid("Only riders can log training sessions");

        // Verify the horse exists and belongs to the rider
        var horse = await _context.Horses.FindAsync(dto.HorseId);
        if (horse == null)
            return NotFound("Horse not found");

        if (horse.OwnerId != userId)
            return Forbid("You can only log sessions for your own horses");

        var session = new TrainingSession
        {
            Date = dto.Date,
            SessionType = Enum.Parse<SessionType>(dto.SessionType),
            DurationMinutes = dto.DurationMinutes,
            Intensity = (int)Enum.Parse<IntensityLevel>(dto.Intensity),
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow,
            HorseId = dto.HorseId,
            RiderId = userId
        };

        _context.TrainingSessions.Add(session);
        await _context.SaveChangesAsync();

        return Ok(new { id = session.Id, message = "Training session logged successfully" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTrainingSessionDto dto)
    {
        var session = await _context.TrainingSessions.FindAsync(id);

        if (session == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        // Only the rider who created the session or a trainer can update
        if (userRole == "Rider" && session.RiderId != userId)
            return Forbid("You can only edit your own sessions");

        if (userRole == "Trainer" && string.IsNullOrEmpty(dto.TrainerFeedback))
            return BadRequest("Trainers can only add feedback");

        // Update fields
        if (userRole == "Rider")
        {
            session.Date = dto.Date;
            session.SessionType = Enum.Parse<SessionType>(dto.SessionType);
            session.DurationMinutes = dto.DurationMinutes;
            session.Intensity = (int)Enum.Parse<IntensityLevel>(dto.Intensity);
            session.Notes = dto.Notes;
        }

        // Trainers can only add feedback
        if (!string.IsNullOrEmpty(dto.TrainerFeedback))
        {
            session.TrainerFeedback = dto.TrainerFeedback;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Training session updated successfully" });
    }

    [HttpPost("{id}/feedback")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> AddFeedback(int id, AddTrainerFeedbackDto dto)
    {
        var session = await _context.TrainingSessions.FindAsync(id);

        if (session == null)
            return NotFound();

        session.TrainerFeedback = dto.TrainerFeedback;
        await _context.SaveChangesAsync();

        // TODO: Add SignalR notification here later
        return Ok(new { message = "Feedback added successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var session = await _context.TrainingSessions.FindAsync(id);

        if (session == null)
            return NotFound();

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        // Only the rider who created the session can delete it
        if (userRole == "Rider" && session.RiderId != userId)
            return Forbid("You can only delete your own sessions");

        _context.TrainingSessions.Remove(session);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Training session deleted successfully" });
    }

    [HttpGet("analytics/horse/{horseId}")]
    public async Task<IActionResult> GetHorseAnalytics(int horseId)
    {
        var sessions = await _context.TrainingSessions
            .Where(ts => ts.HorseId == horseId)
            .OrderByDescending(ts => ts.Date)
            .Take(30) // Last 30 sessions
            .ToListAsync();

        var analytics = new
        {
            TotalSessions = sessions.Count,
            TotalHours = sessions.Sum(s => s.DurationMinutes) / 60.0,
            AverageDuration = sessions.Average(s => s.DurationMinutes),
            SessionTypes = sessions.GroupBy(s => s.SessionType)
                .Select(g => new { Type = g.Key.ToString(), Count = g.Count() }),
            WeeklyTrend = sessions
                .GroupBy(s => new { s.Date.Year, Week = s.Date.DayOfYear / 7 })
                .Select(g => new { Week = g.Key.Week, Hours = g.Sum(s => s.DurationMinutes) / 60.0 })
                .OrderBy(g => g.Week)
                .Take(4)
        };

        return Ok(analytics);
    }
}