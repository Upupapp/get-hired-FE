import { of, throwError } from 'rxjs';
import { EmployerSubscriptionComponent } from './employer-subscription.component';

describe('EmployerSubscriptionComponent billing history compatibility', () => {
  function pageWithBilling(listInvoices: () => any): EmployerSubscriptionComponent {
    return new EmployerSubscriptionComponent(
      {} as any, {} as any, {} as any, {} as any,
      { listInvoices } as any, {} as any, {} as any, {} as any,
    );
  }

  function summaryInvoice() {
    return {
      id: 'payment-17', date: '2026-09-20T09:00:00.000Z', description: 'Growth subscription',
      planName: 'Growth', amount: 3490, currency: 'PHP', status: 'paid',
      paymentMethodLabel: 'PayMongo', receiptUrl: null,
    };
  }

  it('uses summary payment records when the Invoice Vault endpoint is unavailable', () => {
    const page = pageWithBilling(() => throwError({ status: 404 }));
    page.summary = { invoices: [summaryInvoice()] } as any;

    page.loadInvoices();

    expect(page.invoicesError).toBeNull();
    expect(page.invoiceFallbackMode).toBeTrue();
    expect(page.invoicesTotal).toBe(1);
    expect(page.invoices[0].invoiceNumber).toBe('payment-17');
    expect(page.invoices[0].totalAmount).toBe(3490);
    expect(page.invoices[0].status).toBe('paid');
  });

  it('keeps Invoice Vault records when the dedicated endpoint succeeds', () => {
    const invoice = { id: 'inv-1', invoiceNumber: 'GH-0001' } as any;
    const page = pageWithBilling(() => of({ success: true, invoices: [invoice], total: 1 }));
    page.summary = { invoices: [summaryInvoice()] } as any;

    page.loadInvoices();

    expect(page.invoiceFallbackMode).toBeFalse();
    expect(page.invoices).toEqual([invoice]);
  });
});
