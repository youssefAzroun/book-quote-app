using System.ComponentModel.DataAnnotations;

namespace BookQuoteApi.Validation;

/// <summary>
/// Rejects null, empty, and whitespace-only strings.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class NotBlankAttribute : ValidationAttribute
{
    public NotBlankAttribute()
        : base("The {0} field is required.")
    {
    }

    public override bool IsValid(object? value)
    {
        return value is string text && !string.IsNullOrWhiteSpace(text);
    }
}
