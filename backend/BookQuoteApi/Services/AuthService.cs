using BookQuoteApi.Data;
using BookQuoteApi.DTOs;
using BookQuoteApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BookQuoteApi.Services;

public class AuthService(
    AppDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    JwtTokenService jwtTokenService)
{
    public async Task<(int StatusCode, object Body)> RegisterAsync(RegisterRequest request)
    {
        var username = request.Username.Trim();

        if (username.Length is < 3 or > 100)
        {
            return (
                StatusCodes.Status400BadRequest,
                new { message = "Username must be between 3 and 100 characters." });
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length is < 8 or > 100)
        {
            return (
                StatusCodes.Status400BadRequest,
                new { message = "Password must be between 8 and 100 characters." });
        }

        var usernameTaken = await dbContext.Users.AnyAsync(user => user.Username == username);
        if (usernameTaken)
        {
            return (StatusCodes.Status409Conflict, new { message = "Username is already taken." });
        }

        var user = new User
        {
            Username = username,
            PasswordHash = string.Empty
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        dbContext.Users.Add(user);

        try
        {
            await dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return (StatusCodes.Status409Conflict, new { message = "Username is already taken." });
        }

        return (StatusCodes.Status201Created, CreateAuthResponse(user));
    }

    public async Task<(int StatusCode, object Body)> LoginAsync(LoginRequest request)
    {
        var username = request.Username.Trim();

        if (username.Length == 0 || string.IsNullOrWhiteSpace(request.Password))
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user is null)
        {
            return Unauthorized();
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return Unauthorized();
        }

        return (StatusCodes.Status200OK, CreateAuthResponse(user));
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        var token = jwtTokenService.CreateToken(user, out var expiresAtUtc);

        return new AuthResponse
        {
            Token = token,
            Username = user.Username,
            UserId = user.Id,
            ExpiresAtUtc = expiresAtUtc
        };
    }

    private static (int StatusCode, object Body) Unauthorized() =>
        (StatusCodes.Status401Unauthorized, new { message = "Invalid username or password." });
}
