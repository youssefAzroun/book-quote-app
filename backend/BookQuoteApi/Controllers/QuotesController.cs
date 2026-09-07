using System.Security.Claims;
using BookQuoteApi.Data;
using BookQuoteApi.DTOs;
using BookQuoteApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookQuoteApi.Controllers;

[ApiController]
[Route("api/quotes")]
[Authorize]
public class QuotesController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuoteResponse>>> GetQuotes()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized(new { message = "User identity was not found in the token." });
        }

        var quotes = await dbContext.Quotes
            .Where(quote => quote.UserId == userId.Value)
            .OrderByDescending(quote => quote.Id)
            .ToListAsync();

        return Ok(quotes.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuoteResponse>> GetQuote(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized(new { message = "User identity was not found in the token." });
        }

        var quote = await FindOwnedQuoteAsync(id, userId.Value);
        if (quote is null)
        {
            return NotFound(new { message = $"Quote with id {id} was not found." });
        }

        return Ok(ToResponse(quote));
    }

    [HttpPost]
    public async Task<ActionResult<QuoteResponse>> CreateQuote([FromBody] CreateQuoteRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized(new { message = "User identity was not found in the token." });
        }

        var quote = new Quote
        {
            Text = request.Text.Trim(),
            UserId = userId.Value
        };

        dbContext.Quotes.Add(quote);
        await dbContext.SaveChangesAsync();

        var response = ToResponse(quote);
        return CreatedAtAction(nameof(GetQuote), new { id = quote.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<QuoteResponse>> UpdateQuote(int id, [FromBody] UpdateQuoteRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized(new { message = "User identity was not found in the token." });
        }

        var quote = await FindOwnedQuoteAsync(id, userId.Value);
        if (quote is null)
        {
            return NotFound(new { message = $"Quote with id {id} was not found." });
        }

        quote.Text = request.Text.Trim();
        await dbContext.SaveChangesAsync();

        return Ok(ToResponse(quote));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteQuote(int id)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized(new { message = "User identity was not found in the token." });
        }

        var quote = await FindOwnedQuoteAsync(id, userId.Value);
        if (quote is null)
        {
            return NotFound(new { message = $"Quote with id {id} was not found." });
        }

        dbContext.Quotes.Remove(quote);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return int.TryParse(value, out var userId) ? userId : null;
    }

    private Task<Quote?> FindOwnedQuoteAsync(int id, int userId) =>
        dbContext.Quotes.FirstOrDefaultAsync(quote => quote.Id == id && quote.UserId == userId);

    private static QuoteResponse ToResponse(Quote quote) => new()
    {
        Id = quote.Id,
        Text = quote.Text,
        UserId = quote.UserId
    };
}
