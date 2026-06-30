import { Component, Input } from '@angular/core';
import { InvoiceStatus } from '../../subscription.models';

@Component({
  selector: 'app-invoice-status-chip',
  template: `
    <span class="inv-chip" [ngClass]="chipClass" role="status" [attr.aria-label]="'Invoice status: ' + label">
      <span class="inv-chip__dot" aria-hidden="true"></span>
      {{ label }}
    </span>
  `,
  styles: [`
    .inv-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .inv-chip__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .inv-chip--paid    { background: #D1FAE5; color: #065F46; }
    .inv-chip--issued  { background: #DBEAFE; color: #1E40AF; }
    .inv-chip--pending { background: #FEF3C7; color: #92400E; }
    .inv-chip--failed  { background: #FEE2E2; color: #991B1B; }
    .inv-chip--voided  { background: #F1F5F9; color: #475569; }
    .inv-chip--draft   { background: #F1F5F9; color: #64748B; }
    .inv-chip--trial   { background: #EDE9FE; color: #5B21B6; }
    .inv-chip--neutral { background: #F1F5F9; color: #475569; }
  `]
})
export class InvoiceStatusChipComponent {
  @Input() status: InvoiceStatus = '';

  get label(): string {
    const map: Record<string, string> = {
      draft: 'Draft', issued: 'Issued', paid: 'Paid',
      pending: 'Pending', failed: 'Failed',
      voided: 'Void', refunded: 'Refunded',
      trial: 'Trial', manual: 'Manual',
    };
    return map[this.status] || (this.status ? this.status.charAt(0).toUpperCase() + this.status.slice(1) : '—');
  }

  get chipClass(): string {
    const cls: Record<string, string> = {
      paid: 'inv-chip--paid', issued: 'inv-chip--issued',
      pending: 'inv-chip--pending', failed: 'inv-chip--failed',
      voided: 'inv-chip--voided', draft: 'inv-chip--draft',
      trial: 'inv-chip--trial',
    };
    return cls[this.status] || 'inv-chip--neutral';
  }
}
