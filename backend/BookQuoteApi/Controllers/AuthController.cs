using BookQuoteApi.DTOs;
using BookQuoteApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookQuoteApi.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var (statusCode, body) = await authService.RegisterAsync(request);
        return StatusCode(statusCode, body);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (statusCode, body) = await authService.LoginAsync(request);
        return StatusCode(statusCode, body);
    }
}
