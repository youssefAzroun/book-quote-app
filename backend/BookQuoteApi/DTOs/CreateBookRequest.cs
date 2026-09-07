using System.ComponentModel.DataAnnotations;
using BookQuoteApi.Validation;

namespace BookQuoteApi.DTOs;

public class CreateBookRequest
{
    [Required]
    [NotBlank]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [NotBlank]
    [MaxLength(200)]
    public string Author { get; set; } = string.Empty;

    [Required]
    public DateOnly? PublicationDate { get; set; }
}
