import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { BillingService } from '../../services/billing.service';

export interface InvoiceSendModalData {
  invoiceId: string;
  invoiceNumber: string;
  currentEmail?: string | null;
}

@Component({
  selector: 'app-invoice-send-modal',
  templateUrl: './invoice-send-modal.component.html',
  styleUrls: ['./invoice-send-modal.component.scss']
})
export class InvoiceSendModalComponent {
  emailControl: FormControl;
  sending = false;
  sent = false;
  errorMsg: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InvoiceSendModalData,
    private dialogRef: MatDialogRef<InvoiceSendModalComponent>,
    private billing: BillingService,
  ) {
    this.emailControl = new FormControl(data.currentEmail || '', [
      Validators.required, Validators.email,
    ]);
  }

  get invoiceNumber(): string { return this.data && this.data.invoiceNumber ? this.data.invoiceNumber : ''; }

  send(): void {
    if (this.emailControl.invalid || this.sending) return;
    this.sending = true;
    this.errorMsg = null;

    this.billing.sendInvoice(this.data.invoiceId, this.emailControl.value).subscribe({
      next: (res) => {
        this.sending = false;
        if (res && res.success) {
          this.sent = true;
          setTimeout(() => this.dialogRef.close({ sent: true }), 1800);
        } else {
          this.errorMsg = (res && res.error) || 'We couldn\'t send the invoice. Please try again.';
        }
      },
      error: (err) => {
        this.sending = false;
        const msg = err && err.error && err.error.error;
        this.errorMsg = msg || 'We couldn\'t send the invoice. Please try again.';
      }
    });
  }

  close(): void { this.dialogRef.close(); }
}
