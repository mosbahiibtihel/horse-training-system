namespace HorseTraining.API.Controllers;

using HorseTraining.Application.DTOs;
using HorseTraining.Domain.Entities;
using HorseTraining.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompetitionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CompetitionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var competitions = await _context.Competitions
            .Include(c => c.Results)
                .ThenInclude(r => r.Horse)
            .Include(c => c.Results)
                .ThenInclude(r => r.Rider)
            .OrderByDescending(c => c.Date)
            .Select(c => new CompetitionDto
            {
                Id = c.Id,
                Name = c.Name,
                Location = c.Location,
                Date = c.Date,
                Category = c.Category,
                Description = c.Description,
                ResultCount = c.Results.Count,
                Results = c.Results.Select(r => new CompetitionResultDto
                {
                    Id = r.Id,
                    Ranking = r.Ranking,
                    JumpHeight = r.JumpHeight,
                    Time = r.Time,
                    Notes = r.Notes,
                    HorseName = r.Horse.Name,
                    RiderName = r.Rider.FullName,
                    HorseId = r.HorseId
                }).OrderBy(r => r.Ranking).ToList()
            })
            .ToListAsync();

        return Ok(competitions);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCompetitionDto dto)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        if (userRole != "StableManager")
            return Forbid();

        var competition = new Competition
        {
            Name = dto.Name,
            Location = dto.Location,
            Date = dto.Date,
            Category = dto.Category,
            Description = dto.Description
        };

        _context.Competitions.Add(competition);
        await _context.SaveChangesAsync();
        return Ok(competition.Id);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        if (userRole != "StableManager")
            return Forbid();

        var competition = await _context.Competitions.FindAsync(id);
        if (competition == null) return NotFound();
        _context.Competitions.Remove(competition);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/results")]
    public async Task<IActionResult> AddResult(
        int id, CreateCompetitionResultDto dto)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        if (userRole != "StableManager" && userRole != "Trainer")
            return Forbid();

        var competition = await _context.Competitions.FindAsync(id);
        if (competition == null) return NotFound();

        var rider = await _context.Users.FindAsync(dto.RiderId);
        if (rider == null)
            return BadRequest("Selected rider does not exist.");

        var result = new CompetitionResult
        {
            CompetitionId = id,
            HorseId = dto.HorseId,
            RiderId = dto.RiderId,
            Ranking = dto.Ranking,
            JumpHeight = dto.JumpHeight,
            Time = dto.Time,
            Notes = dto.Notes
        };

        _context.CompetitionResults.Add(result);
        await _context.SaveChangesAsync();
        return Ok(result.Id);
    }

    [HttpDelete("{id}/results/{resultId}")]
    public async Task<IActionResult> DeleteResult(int id, int resultId)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        if (userRole != "StableManager" && userRole != "Trainer")
            return Forbid();

        var result = await _context.CompetitionResults
            .FirstOrDefaultAsync(r =>
                r.Id == resultId && r.CompetitionId == id);
        if (result == null) return NotFound();
        _context.CompetitionResults.Remove(result);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}