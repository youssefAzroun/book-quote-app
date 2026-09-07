namespace BookQuoteApi.DTOs;

public class AuthResponse
{
    public required string Token { get; set; }
    public required string Username { get; set; }
    public int UserId { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
}
