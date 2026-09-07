import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Quote } from '../../core/models/quote.models';
import { QuoteService } from '../../core/services/quote.service';
import { getApiErrorMessage } from '../../core/utils/api-error';
import { notBlankValidator } from '../../core/validators/not-blank.validator';

@Component({
  selector: 'app-quotes',
  imports: [ReactiveFormsModule],
  templateUrl: './quotes.html',
  styleUrl: './quotes.scss',
})
export class Quotes implements OnInit {
  private readonly quoteService = inject(QuoteService);
  private readonly fb = inject(FormBuilder);

  readonly quotes = signal<Quote[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly isDeletingId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly editingQuoteId = signal<number | null>(null);
  readonly showForm = signal(false);

  readonly form = this.fb.nonNullable.group({
    text: ['', [notBlankValidator, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.quoteService.getAll().subscribe({
      next: (quotes) => {
        this.quotes.set(quotes);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(getApiErrorMessage(error, 'Could not load quotes.'));
      },
    });
  }

  startCreate(): void {
    this.editingQuoteId.set(null);
    this.form.reset({ text: '' });
    this.showForm.set(true);
    this.errorMessage.set(null);
  }

  startEdit(quote: Quote): void {
    this.editingQuoteId.set(quote.id);
    this.form.reset({ text: quote.text });
    this.showForm.set(true);
    this.errorMessage.set(null);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingQuoteId.set(null);
    this.form.reset({ text: '' });
  }

  submit(): void {
    this.errorMessage.set(null);

    const { text } = this.form.getRawValue();
    this.form.patchValue({ text: text.trim() });
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    const request = this.form.getRawValue();
    const editingId = this.editingQuoteId();
    this.isSubmitting.set(true);

    const request$ =
      editingId === null
        ? this.quoteService.create(request)
        : this.quoteService.update(editingId, request);

    request$.subscribe({
      next: (saved) => {
        if (editingId === null) {
          this.quotes.update((items) => [saved, ...items]);
        } else {
          this.quotes.update((items) => items.map((item) => (item.id === saved.id ? saved : item)));
        }

        this.isSubmitting.set(false);
        this.cancelForm();
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          getApiErrorMessage(
            error,
            editingId === null ? 'Could not create the quote.' : 'Could not update the quote.',
          ),
        );
      },
    });
  }

  deleteQuote(quote: Quote): void {
    const preview = quote.text.length > 60 ? `${quote.text.slice(0, 60)}…` : quote.text;
    const confirmed = window.confirm(
      `Delete quote?\n\n"${preview}"\n\nThis action cannot be undone.`,
    );
    if (!confirmed || this.isDeletingId() !== null) {
      return;
    }

    this.isDeletingId.set(quote.id);
    this.errorMessage.set(null);

    this.quoteService.delete(quote.id).subscribe({
      next: () => {
        this.quotes.update((items) => items.filter((item) => item.id !== quote.id));
        if (this.editingQuoteId() === quote.id) {
          this.cancelForm();
        }
        this.isDeletingId.set(null);
      },
      error: (error: unknown) => {
        this.isDeletingId.set(null);
        this.errorMessage.set(getApiErrorMessage(error, 'Could not delete the quote.'));
      },
    });
  }
}
