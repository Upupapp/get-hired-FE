import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceDetail } from '../../subscription.models';
import { BillingService } from '../../services/billing.service';
import { InvoiceSendModalComponent } from '../invoice-send-modal/invoice-send-modal.component';

@Component({
  selector: 'app-invoice-detail-drawer',
  templateUrl: './invoice-detail-drawer.component.html',
  styleUrls: ['./invoice-detail-drawer.component.scss']
})
export class InvoiceDetailDrawerComponent implements OnChanges {
  @Input() invoiceId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  invoice: InvoiceDetail | null = null;
  loading = false;
  errorMsg: string | null = null;
  showEvents = false;

  constructor(
    private billing: BillingService,
    private dialog: MatDialog,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceId'] && this.invoiceId) {
      this.load(this.invoiceId);
    }
    if (changes['invoiceId'] && !this.invoiceId) {
      this.invoice = null;
      this.errorMsg = null;
    }
  }

  load(id: string): void {
    this.loading = true;
    this.errorMsg = null;
    this.invoice = null;
    this.showEvents = false;

    this.billing.getInvoice(id).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.success && res.invoice) {
          this.invoice = res.invoice;
        } else {
          this.errorMsg = 'Invoice details are unavailable.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'We couldn\'t load this invoice. Please try again.';
      }
    });
  }

  openInvoice(): void {
    if (!this.invoice || !this.invoice.id) return;
    const url = this.billing.getInvoiceViewUrl(this.invoice.id);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  openSendModal(): void {
    if (!this.invoice) return;
    this.dialog.open(InvoiceSendModalComponent, {
      width: '480px',
      maxWidth: '96vw',
      panelClass: 'gh-dialog',
      data: {
        invoiceId: this.invoice.id,
        invoiceNumber: this.invoice.invoiceNumber,
        currentEmail: this.invoice.customerEmail || null,
      }
    });
  }

  close(): void { this.closed.emit(); }

  formatAmount(amount: number, currency: string): string {
    const cur = currency || 'PHP';
    const num = isNaN(amount) ? 0 : amount;
    return cur + ' ' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatBillingPeriod(start: string | null | undefined, end: string | null | undefined): string {
    if (!start || !end) return '—';
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(start).toLocaleDateString('en-PH', opts) + ' – ' + new Date(end).toLocaleDateString('en-PH', opts);
  }

  formatEventType(type: string): string {
    return (type || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  get billingPeriod(): string {
    return this.invoice ? this.formatBillingPeriod(this.invoice.billingPeriodStart, this.invoice.billingPeriodEnd) : '—';
  }

  get totalFormatted(): string {
    return this.invoice ? this.formatAmount(this.invoice.totalAmount, this.invoice.currency) : '—';
  }
}
