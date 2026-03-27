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
        var horses = await _context.Horses
            .Include(h => h.Owner)
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
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var horse = new Horse
        {
            Name = dto.Name,
            Breed = dto.Breed,
            Age = dto.Age,
            Gender = dto.Gender,
            Discipline = Enum.Parse<Discipline>(dto.Discipline),
            PhotoUrl = dto.PhotoUrl,
            OwnerId = userId
        };

        _context.Horses.Add(horse);
        await _context.SaveChangesAsync();

        return Ok(new { id = horse.Id, message = "Horse created successfully" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateHorseDto dto)
    {
        // Get the horse from database
        var horse = await _context.Horses.FindAsync(id);

        if (horse == null)
            return NotFound(new { message = "Horse not found" });

        // Verify the current user owns this horse
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (horse.OwnerId != userId)
            return Forbid(); // User doesn't own this horse

        // Update the horse properties
        horse.Name = dto.Name;
        horse.Breed = dto.Breed;
        horse.Age = dto.Age;
        horse.Gender = dto.Gender;
        horse.Discipline = Enum.Parse<Discipline>(dto.Discipline);
        horse.PhotoUrl = dto.PhotoUrl;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Horse updated successfully", id = horse.Id });
        }
        catch (DbUpdateConcurrencyException)
        {
            return StatusCode(500, new { message = "Error updating horse" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        // Get the horse from database
        var horse = await _context.Horses.FindAsync(id);

        if (horse == null)
            return NotFound(new { message = "Horse not found" });

        // Verify the current user owns this horse
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (horse.OwnerId != userId)
            return Forbid(); // User doesn't own this horse

        try
        {
            _context.Horses.Remove(horse);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Horse deleted successfully" });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Error deleting horse" });
        }
    }

    [HttpGet("test")]
    [AllowAnonymous]
    public IActionResult Test()
    {
        return Ok(new { message = "Horses controller is working!", timestamp = DateTime.Now });
    }
}