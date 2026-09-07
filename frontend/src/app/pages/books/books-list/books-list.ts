import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book } from '../../../core/models/book.models';
import { BookService } from '../../../core/services/book.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-books-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './books-list.html',
  styleUrl: './books-list.scss',
})
export class BooksList implements OnInit {
  private readonly bookService = inject(BookService);

  readonly books = signal<Book[]>([]);
  readonly isLoading = signal(true);
  readonly isDeletingId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.bookService.getAll().subscribe({
      next: (books) => {
        this.books.set(books);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(getApiErrorMessage(error, 'Could not load books.'));
      },
    });
  }

  deleteBook(book: Book): void {
    const confirmed = window.confirm(
      `Delete book?\n\n"${book.title}"\n\nThis action cannot be undone.`,
    );
    if (!confirmed || this.isDeletingId() !== null) {
      return;
    }

    this.isDeletingId.set(book.id);
    this.errorMessage.set(null);

    this.bookService.delete(book.id).subscribe({
      next: () => {
        this.books.update((items) => items.filter((item) => item.id !== book.id));
        this.isDeletingId.set(null);
      },
      error: (error: unknown) => {
        this.isDeletingId.set(null);
        this.errorMessage.set(getApiErrorMessage(error, 'Could not delete the book.'));
      },
    });
  }
}
