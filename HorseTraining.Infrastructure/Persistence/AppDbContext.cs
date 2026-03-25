namespace HorseTraining.Infrastructure.Persistence;

using HorseTraining.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Horse> Horses => Set<Horse>();
    public DbSet<TrainingSession> TrainingSessions => Set<TrainingSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.FullName).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
        });

        modelBuilder.Entity<Horse>(entity =>
        {
            entity.Property(h => h.Name).HasMaxLength(100).IsRequired();
            entity.Property(h => h.Breed).HasMaxLength(100).IsRequired();
            entity.HasOne(h => h.Owner)
                  .WithMany(u => u.Horses)
                  .HasForeignKey(h => h.OwnerId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TrainingSession>(entity =>
        {
            entity.HasOne(t => t.Horse)
                  .WithMany(h => h.TrainingSessions)
                  .HasForeignKey(t => t.HorseId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.Rider)
                  .WithMany(u => u.TrainingSessions)
                  .HasForeignKey(t => t.RiderId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}