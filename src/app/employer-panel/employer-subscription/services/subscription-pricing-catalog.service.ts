import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PricingCatalogResponse } from '../subscription-v4.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionPricingCatalogService {
  private apiBase = environment.api_url;

  constructor(private http: HttpClient) {}

  getCatalog(): Observable<PricingCatalogResponse> {
    return this.http.get<PricingCatalogResponse>(`${this.apiBase}/subscriptions/pricing-catalog`);
  }
}
