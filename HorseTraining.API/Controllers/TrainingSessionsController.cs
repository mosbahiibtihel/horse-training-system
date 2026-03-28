namespace HorseTraining.API.Controllers;

using HorseTraining.API.Services;
using HorseTraining.Application.DTOs;
using HorseTraining.Domain.Entities;
using HorseTraining.Domain.Enums;
using HorseTraining.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrainingSessionsController : ControllerBase
{
    private readonly AppDbContext _context;

    private readonly NotificationService _notificationService;

   

    public TrainingSessionsController(AppDbContext context, NotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? horseId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var query = _context.TrainingSessions
            .Include(s => s.Horse)
            .Include(s => s.Rider)
            .AsQueryable();

        if (horseId.HasValue)
            query = query.Where(s => s.HorseId == horseId);

        if (fromDate.HasValue)
            query = query.Where(s => s.Date >= fromDate);

        if (toDate.HasValue)
            query = query.Where(s => s.Date <= toDate);

        var sessions = await query
            .OrderByDescending(s => s.Date)
            .Select(s => new TrainingSessionDto
            {
                Id = s.Id,
                Date = s.Date,
                SessionType = s.SessionType.ToString(),
                DurationMinutes = s.DurationMinutes,
                Intensity = s.Intensity,
                Notes = s.Notes,
                TrainerFeedback = s.TrainerFeedback,
                CreatedAt = s.CreatedAt,
                HorseId = s.HorseId,
                HorseName = s.Horse.Name,
                RiderId = s.RiderId,
                RiderName = s.Rider.FullName,
                HasFeedback = s.TrainerFeedback != null
            })
            .ToListAsync();

        return Ok(sessions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var session = await _context.TrainingSessions
            .Include(s => s.Horse)
            .Include(s => s.Rider)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (session == null) return NotFound();

        return Ok(new TrainingSessionDto
        {
            Id = session.Id,
            Date = session.Date,
            SessionType = session.SessionType.ToString(),
            DurationMinutes = session.DurationMinutes,
            Intensity = session.Intensity,
            Notes = session.Notes,
            TrainerFeedback = session.TrainerFeedback,
            CreatedAt = session.CreatedAt,
            HorseId = session.HorseId,
            HorseName = session.Horse.Name,
            RiderId = session.RiderId,
            RiderName = session.Rider.FullName,
            HasFeedback = session.TrainerFeedback != null
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTrainingSessionDto dto)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var session = new TrainingSession
        {
            Date = dto.Date,
            SessionType = Enum.Parse<SessionType>(dto.SessionType),
            DurationMinutes = dto.DurationMinutes,
            Intensity = dto.Intensity,
            Notes = dto.Notes,
            HorseId = dto.HorseId,
            RiderId = userId
        };

        _context.TrainingSessions.Add(session);
        await _context.SaveChangesAsync();
        return Ok(session.Id);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTrainingSessionDto dto)
    {
        var session = await _context.TrainingSessions.FindAsync(id);
        if (session == null) return NotFound();

        session.Date = dto.Date;
        session.SessionType = Enum.Parse<SessionType>(dto.SessionType);
        session.DurationMinutes = dto.DurationMinutes;
        session.Intensity = dto.Intensity;
        session.Notes = dto.Notes;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/feedback")]
    public async Task<IActionResult> AddFeedback(int id, AddFeedbackDto dto)
    {
        var session = await _context.TrainingSessions
            .Include(s => s.Horse)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (session == null) return NotFound();

        session.TrainerFeedback = dto.TrainerFeedback;
        await _context.SaveChangesAsync();

        // Fire real-time notification to the rider
        await _notificationService.SendToUser(
            session.RiderId.ToString(),
            "feedback",
            $"Your trainer left feedback on {session.Horse.Name}'s {session.SessionType} session."
        );

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var session = await _context.TrainingSessions.FindAsync(id);
        if (session == null) return NotFound();

        _context.TrainingSessions.Remove(session);
        await _context.SaveChangesAsync();
        return NoContent();
    }



   

}