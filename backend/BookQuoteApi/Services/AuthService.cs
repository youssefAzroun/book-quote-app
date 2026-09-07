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
        await dbContext.SaveChangesAsync();

        return (StatusCodes.Status201Created, CreateAuthResponse(user));
    }

    public async Task<(int StatusCode, object Body)> LoginAsync(LoginRequest request)
    {
        var username = request.Username.Trim();

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
