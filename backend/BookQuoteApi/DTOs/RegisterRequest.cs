using System.ComponentModel.DataAnnotations;
using BookQuoteApi.Validation;

namespace BookQuoteApi.DTOs;

public class RegisterRequest
{
    [Required]
    [NotBlank]
    [MinLength(3)]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [NotBlank]
    [MinLength(8)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}
