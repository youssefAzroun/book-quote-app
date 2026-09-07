using BookQuoteApi.Data;
using BookQuoteApi.DTOs;
using BookQuoteApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookQuoteApi.Controllers;

[ApiController]
[Route("api/books")]
[Authorize]
public class BooksController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookResponse>>> GetBooks()
    {
        var books = await dbContext.Books
            .OrderBy(book => book.Title)
            .ToListAsync();

        return Ok(books.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookResponse>> GetBook(int id)
    {
        var book = await dbContext.Books.FindAsync(id);
        if (book is null)
        {
            return NotFound(new { message = $"Book with id {id} was not found." });
        }

        return Ok(ToResponse(book));
    }

    [HttpPost]
    public async Task<ActionResult<BookResponse>> CreateBook([FromBody] CreateBookRequest request)
    {
        var title = request.Title.Trim();
        var author = request.Author.Trim();

        if (title.Length == 0 || author.Length == 0)
        {
            return BadRequest(new { message = "Title and author are required." });
        }

        var book = new Book
        {
            Title = title,
            Author = author,
            PublicationDate = request.PublicationDate!.Value
        };

        dbContext.Books.Add(book);
        await dbContext.SaveChangesAsync();

        var response = ToResponse(book);
        return CreatedAtAction(nameof(GetBook), new { id = book.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BookResponse>> UpdateBook(int id, [FromBody] UpdateBookRequest request)
    {
        var book = await dbContext.Books.FindAsync(id);
        if (book is null)
        {
            return NotFound(new { message = $"Book with id {id} was not found." });
        }

        var title = request.Title.Trim();
        var author = request.Author.Trim();

        if (title.Length == 0 || author.Length == 0)
        {
            return BadRequest(new { message = "Title and author are required." });
        }

        book.Title = title;
        book.Author = author;
        book.PublicationDate = request.PublicationDate!.Value;

        await dbContext.SaveChangesAsync();

        return Ok(ToResponse(book));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await dbContext.Books.FindAsync(id);
        if (book is null)
        {
            return NotFound(new { message = $"Book with id {id} was not found." });
        }

        dbContext.Books.Remove(book);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private static BookResponse ToResponse(Book book) => new()
    {
        Id = book.Id,
        Title = book.Title,
        Author = book.Author,
        PublicationDate = book.PublicationDate
    };
}
