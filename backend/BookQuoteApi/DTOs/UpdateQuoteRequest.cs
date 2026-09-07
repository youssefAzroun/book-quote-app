using System.ComponentModel.DataAnnotations;
using BookQuoteApi.Validation;

namespace BookQuoteApi.DTOs;

public class UpdateQuoteRequest
{
    [Required]
    [NotBlank]
    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;
}
