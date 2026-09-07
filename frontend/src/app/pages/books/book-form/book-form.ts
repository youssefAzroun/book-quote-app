import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { notBlankValidator } from '../../../core/validators/not-blank.validator';

@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
})
export class BookForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);

  readonly bookId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.bookId;

  readonly isLoading = signal(this.isEditMode);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [notBlankValidator, Validators.maxLength(200)]],
    author: ['', [notBlankValidator, Validators.maxLength(200)]],
    publicationDate: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (!this.isEditMode || !this.bookId) {
      return;
    }

    const id = Number(this.bookId);
    if (Number.isNaN(id)) {
      this.isLoading.set(false);
      this.errorMessage.set('Invalid book id.');
      return;
    }

    this.bookService.getById(id).subscribe({
      next: (book) => {
        this.form.patchValue({
          title: book.title,
          author: book.author,
          publicationDate: book.publicationDate,
        });
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(getApiErrorMessage(error, 'Could not load the book.'));
      },
    });
  }

  submit(): void {
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    this.form.patchValue({
      title: raw.title.trim(),
      author: raw.author.trim(),
    });
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting() || this.isLoading()) {
      return;
    }

    const request = this.form.getRawValue();
    this.isSubmitting.set(true);

    const request$ = this.isEditMode
      ? this.bookService.update(Number(this.bookId), request)
      : this.bookService.create(request);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl('/books');
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          getApiErrorMessage(error, this.isEditMode ? 'Could not update the book.' : 'Could not create the book.'),
        );
      },
    });
  }
}
