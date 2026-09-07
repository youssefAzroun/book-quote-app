import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { getApiErrorMessage } from '../../core/utils/api-error';
import { notBlankValidator } from '../../core/validators/not-blank.validator';
import { passwordMatchValidator } from '../../core/validators/password-match.validator';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      username: ['', [notBlankValidator, Validators.minLength(3), Validators.maxLength(100)]],
      password: ['', [notBlankValidator, Validators.minLength(8), Validators.maxLength(100)]],
      confirmPassword: ['', [notBlankValidator]],
    },
    { validators: passwordMatchValidator },
  );

  submit(): void {
    this.serverError.set(null);

    const { username, password } = this.form.getRawValue();
    this.form.patchValue({ username: username.trim() });
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.authService.register({ username: username.trim(), password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl('/login');
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.serverError.set(getApiErrorMessage(error, 'Registration failed. Please try again.'));
      },
    });
  }
}
