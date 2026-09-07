using System.ComponentModel.DataAnnotations;

namespace BookQuoteApi.DTOs;

public class UpdateBookRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Author { get; set; } = string.Empty;

    [Required]
    public DateOnly? PublicationDate { get; set; }
}
