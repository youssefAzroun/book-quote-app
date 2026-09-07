using System.ComponentModel.DataAnnotations;

namespace BookQuoteApi.DTOs;

public class CreateQuoteRequest
{
    [Required]
    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;
}
