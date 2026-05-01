// File: Controllers/HorsesController.cs
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
public class HorsesController : ControllerBase
{
    private readonly AppDbContext _context;

    public HorsesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        var query = _context.Horses
            .Include(h => h.Owner)
            .AsQueryable();

        // Riders only see their own horses
        if (userRole == "Rider")
            query = query.Where(h => h.OwnerId == userId);

        var horses = await query
            .Select(h => new HorseDto
            {
                Id = h.Id,
                Name = h.Name,
                Breed = h.Breed,
                Age = h.Age,
                Gender = h.Gender,
                Discipline = h.Discipline.ToString(),
                PhotoUrl = h.PhotoUrl,
                OwnerName = h.Owner.FullName,
                OwnerId = h.OwnerId
            })
            .ToListAsync();

        return Ok(horses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var horse = await _context.Horses
            .Include(h => h.Owner)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (horse == null)
            return NotFound();

        return Ok(new HorseDto
        {
            Id = horse.Id,
            Name = horse.Name,
            Breed = horse.Breed,
            Age = horse.Age,
            Gender = horse.Gender,
            Discipline = horse.Discipline.ToString(),
            PhotoUrl = horse.PhotoUrl,
            OwnerName = horse.Owner?.FullName ?? string.Empty,
            OwnerId = horse.OwnerId
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateHorseDto dto)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        // Only Stable Manager can create horses
        if (userRole != "StableManager")
            return Forbid();

        var owner = await _context.Users.FindAsync(dto.OwnerId);
        if (owner == null)
            return BadRequest("Selected rider does not exist.");
        if (owner.Role != UserRole.Rider)
            return BadRequest("Selected owner must be a rider.");

        var horse = new Horse
        {
            Name = dto.Name,
            Breed = dto.Breed,
            Age = dto.Age,
            Gender = dto.Gender,
            Discipline = Enum.Parse<Discipline>(dto.Discipline),
            PhotoUrl = dto.PhotoUrl,
            OwnerId = dto.OwnerId
        };

        _context.Horses.Add(horse);
        await _context.SaveChangesAsync();
        return Ok(horse.Id);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateHorseDto dto)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        if (userRole != "StableManager")
            return Forbid();

        var horse = await _context.Horses.FindAsync(id);
        if (horse == null) return NotFound();

        var owner = await _context.Users.FindAsync(dto.OwnerId);
        if (owner == null)
            return BadRequest("Selected rider does not exist.");
        if (owner.Role != UserRole.Rider)
            return BadRequest("Selected owner must be a rider.");

        horse.Name = dto.Name;
        horse.Breed = dto.Breed;
        horse.Age = dto.Age;
        horse.Gender = dto.Gender;
        horse.Discipline = Enum.Parse<Discipline>(dto.Discipline);
        horse.PhotoUrl = dto.PhotoUrl;
        horse.OwnerId = dto.OwnerId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        if (userRole != "StableManager")
            return Forbid();

        var horse = await _context.Horses.FindAsync(id);
        if (horse == null) return NotFound();

        _context.Horses.Remove(horse);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("riders")]
    public async Task<IActionResult> GetRiders()
    {
        var riders = await _context.Users
            .Where(u => u.Role == UserRole.Rider)
            .Select(u => new { u.Id, u.FullName, u.Email })
            .ToListAsync();
        return Ok(riders);
    }

    [HttpGet("test")]
    [AllowAnonymous]
    public IActionResult Test()
    {
        return Ok(new { message = "Horses controller is working!", timestamp = DateTime.Now });
    }
}