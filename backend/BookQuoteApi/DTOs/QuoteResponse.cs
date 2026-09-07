namespace BookQuoteApi.DTOs;

public class QuoteResponse
{
    public int Id { get; set; }
    public required string Text { get; set; }
    public int UserId { get; set; }
}
