using System.ComponentModel.DataAnnotations;
using BookQuoteApi.Validation;

namespace BookQuoteApi.DTOs;

public class LoginRequest
{
    [Required]
    [NotBlank]
    public string Username { get; set; } = string.Empty;

    [Required]
    [NotBlank]
    public string Password { get; set; } = string.Empty;
}
