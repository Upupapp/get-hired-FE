import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
  InvoiceListResponse,
  InvoiceDetail,
  BillingProfile,
} from '../subscription.models';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private apiBase = environment.api_url;

  constructor(private http: HttpClient) {}

  // ── Invoices ────────────────────────────────────────────────────────────────

  listInvoices(opts?: { limit?: number; offset?: number; status?: string }): Observable<InvoiceListResponse> {
    let params = new HttpParams();
    if (opts && opts.limit != null)  params = params.set('limit',  String(opts.limit));
    if (opts && opts.offset != null) params = params.set('offset', String(opts.offset));
    if (opts && opts.status)         params = params.set('status', opts.status);
    return this.http.get<InvoiceListResponse>(`${this.apiBase}/billing/invoices`, { params });
  }

  getInvoice(id: string): Observable<{ success: boolean; invoice: InvoiceDetail }> {
    return this.http.get<{ success: boolean; invoice: InvoiceDetail }>(
      `${this.apiBase}/billing/invoices/${id}`
    );
  }

  getInvoiceViewUrl(id: string): string {
    return `${this.apiBase}/billing/invoices/${id}/view`;
  }

  sendInvoice(id: string, email?: string): Observable<{ success: boolean; message?: string; error?: string }> {
    const body: any = {};
    if (email) body['email'] = email;
    return this.http.post<{ success: boolean; message?: string; error?: string }>(
      `${this.apiBase}/billing/invoices/${id}/send`, body
    );
  }

  // ── Billing profile ─────────────────────────────────────────────────────────

  getBillingProfile(): Observable<{ success: boolean; profile: BillingProfile }> {
    return this.http.get<{ success: boolean; profile: BillingProfile }>(
      `${this.apiBase}/billing/profile`
    );
  }

  updateBillingProfile(profile: BillingProfile): Observable<{ success: boolean; profile: BillingProfile; message?: string }> {
    return this.http.put<{ success: boolean; profile: BillingProfile; message?: string }>(
      `${this.apiBase}/billing/profile`, profile
    );
  }
}
