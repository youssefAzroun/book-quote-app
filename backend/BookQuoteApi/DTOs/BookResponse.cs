namespace BookQuoteApi.DTOs;

public class BookResponse
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Author { get; set; }
    public DateOnly PublicationDate { get; set; }
}
