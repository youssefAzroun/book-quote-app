namespace BookQuoteApi.Models;

public class User
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }

    public ICollection<Quote> Quotes { get; set; } = new List<Quote>();
}
