using BookQuoteApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BookQuoteApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Quote> Quotes => Set<Quote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.Property(user => user.Username).HasMaxLength(100).IsRequired();
            entity.Property(user => user.PasswordHash).IsRequired();
            entity.HasIndex(user => user.Username).IsUnique();

            entity.HasMany(user => user.Quotes)
                .WithOne(quote => quote.User)
                .HasForeignKey(quote => quote.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(book => book.Id);
            entity.Property(book => book.Title).HasMaxLength(200).IsRequired();
            entity.Property(book => book.Author).HasMaxLength(200).IsRequired();
            entity.Property(book => book.PublicationDate).IsRequired();
        });

        modelBuilder.Entity<Quote>(entity =>
        {
            entity.HasKey(quote => quote.Id);
            entity.Property(quote => quote.Text).HasMaxLength(2000).IsRequired();
        });
    }
}
