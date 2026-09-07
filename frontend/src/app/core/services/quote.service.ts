import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quote, QuoteRequest } from '../models/quote.models';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/quotes`;

  getAll(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.baseUrl);
  }

  getById(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.baseUrl}/${id}`);
  }

  create(request: QuoteRequest): Observable<Quote> {
    return this.http.post<Quote>(this.baseUrl, request);
  }

  update(id: number, request: QuoteRequest): Observable<Quote> {
    return this.http.put<Quote>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
