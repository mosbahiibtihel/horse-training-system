namespace HorseTraining.API.Controllers;

using HorseTraining.Application.DTOs;
using HorseTraining.Domain.Entities;
using HorseTraining.Domain.Enums;
using HorseTraining.Infrastructure.Persistence;
using HorseTraining.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("Email already exists.");

        using var hmac = new HMACSHA512();

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email.ToLower(),
            PasswordHash = Convert.ToBase64String(
                hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password))),
            Role = Enum.Parse<UserRole>(dto.Role)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { token = _tokenService.CreateToken(user) });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (user == null) return Unauthorized("Invalid email.");

        return Ok(new
        {
            token = _tokenService.CreateToken(user),
            role = user.Role.ToString(),
            fullName = user.FullName,
            id = user.Id
        });
    }
}