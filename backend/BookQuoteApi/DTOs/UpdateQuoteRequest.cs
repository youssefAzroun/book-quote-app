using System.ComponentModel.DataAnnotations;

namespace BookQuoteApi.DTOs;

public class UpdateQuoteRequest
{
    [Required]
    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;
}
