import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { CheckoutIntentRequest, CheckoutIntentResponse } from '../subscription-v4.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionCheckoutIntentService {
  private apiBase = environment.api_url;

  constructor(private http: HttpClient) {}

  createCheckoutIntent(request: CheckoutIntentRequest): Observable<CheckoutIntentResponse> {
    return this.http.post<CheckoutIntentResponse>(
      `${this.apiBase}/subscriptions/checkout-intent`,
      request
    );
  }

  getCheckoutIntentStatus(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/subscriptions/checkout-intent/${id}/status`);
  }
}
