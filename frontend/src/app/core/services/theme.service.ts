import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'bookquote_theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSignal = signal<AppTheme>(this.readInitialTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  isDark(): boolean {
    return this.themeSignal() === 'dark';
  }

  toggleTheme(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme): void {
    this.themeSignal.set(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private readInitialTheme(): AppTheme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: AppTheme): void {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }
}
