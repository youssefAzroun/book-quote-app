import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { BooksList } from './pages/books/books-list/books-list';
import { BookForm } from './pages/books/book-form/book-form';
import { Quotes } from './pages/quotes/quotes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'books', component: BooksList, canActivate: [authGuard] },
  { path: 'books/new', component: BookForm, canActivate: [authGuard] },
  { path: 'books/edit/:id', component: BookForm, canActivate: [authGuard] },
  { path: 'quotes', component: Quotes, canActivate: [authGuard] },
  { path: '**', redirectTo: 'books' },
];
