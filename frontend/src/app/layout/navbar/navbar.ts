import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;
  readonly theme = this.themeService.theme;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }

  onNavLinkClick(): void {
    this.closeMobileMenu();
  }

  private closeMobileMenu(): void {
    const menu = document.getElementById('mainNavbar');
    const toggler = document.querySelector<HTMLButtonElement>('.navbar-toggler');

    if (!menu?.classList.contains('show')) {
      return;
    }

    const bootstrapApi = (
      window as Window & {
        bootstrap?: { Collapse: { getOrCreateInstance: (el: Element) => { hide: () => void } } };
      }
    ).bootstrap;

    if (bootstrapApi?.Collapse) {
      bootstrapApi.Collapse.getOrCreateInstance(menu).hide();
      return;
    }

    menu.classList.remove('show');
    toggler?.setAttribute('aria-expanded', 'false');
  }
}
