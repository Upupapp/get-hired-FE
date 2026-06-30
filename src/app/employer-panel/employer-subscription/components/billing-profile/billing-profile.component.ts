import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BillingProfile } from '../../subscription.models';
import { BillingService } from '../../services/billing.service';

@Component({
  selector: 'app-billing-profile',
  templateUrl: './billing-profile.component.html',
  styleUrls: ['./billing-profile.component.scss']
})
export class BillingProfileComponent implements OnInit {
  form: FormGroup;
  loading = false;
  saving = false;
  saved = false;
  errorMsg: string | null = null;

  constructor(private billing: BillingService) {
    this.form = new FormGroup({
      legalName:           new FormControl(''),
      billingEmail:        new FormControl('', [Validators.email]),
      financeContactName:  new FormControl(''),
      financeContactEmail: new FormControl('', [Validators.email]),
      billingAddressLine1: new FormControl(''),
      billingAddressLine2: new FormControl(''),
      city:                new FormControl(''),
      provinceState:       new FormControl(''),
      country:             new FormControl('Philippines'),
      postalCode:          new FormControl(''),
      taxIdentifier:       new FormControl(''),
      autoSendInvoices:    new FormControl(false),
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = null;

    this.billing.getBillingProfile().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.success && res.profile) {
          this.patchForm(res.profile);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'We couldn\'t load your billing profile. Please try again.';
      }
    });
  }

  patchForm(p: BillingProfile): void {
    this.form.patchValue({
      legalName:           p.legalName || '',
      billingEmail:        p.billingEmail || '',
      financeContactName:  p.financeContactName || '',
      financeContactEmail: p.financeContactEmail || '',
      billingAddressLine1: p.billingAddressLine1 || '',
      billingAddressLine2: p.billingAddressLine2 || '',
      city:                p.city || '',
      provinceState:       p.provinceState || '',
      country:             p.country || 'Philippines',
      postalCode:          p.postalCode || '',
      taxIdentifier:       p.taxIdentifier || '',
      autoSendInvoices:    !!p.autoSendInvoices,
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.saved = false;
    this.errorMsg = null;

    this.billing.updateBillingProfile(this.form.value as BillingProfile).subscribe({
      next: (res) => {
        this.saving = false;
        if (res && res.success) {
          this.saved = true;
          setTimeout(() => { this.saved = false; }, 3000);
        } else {
          this.errorMsg = 'Couldn\'t save your billing profile. Please try again.';
        }
      },
      error: (err) => {
        this.saving = false;
        const msg = err && err.error && err.error.error;
        this.errorMsg = msg || 'Couldn\'t save your billing profile. Please try again.';
      }
    });
  }

  get billingEmailCtrl(): FormControl { return this.form.get('billingEmail') as FormControl; }
  get financeEmailCtrl(): FormControl { return this.form.get('financeContactEmail') as FormControl; }
}
