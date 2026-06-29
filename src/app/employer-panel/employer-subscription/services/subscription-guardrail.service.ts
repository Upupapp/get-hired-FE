import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { SubscriptionSummaryResponse } from '../subscription-v4.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionGuardrailService {
  private apiBase = environment.api_url;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<SubscriptionSummaryResponse> {
    return this.http.get<SubscriptionSummaryResponse>(`${this.apiBase}/subscriptions/employer/summary`);
  }
}
