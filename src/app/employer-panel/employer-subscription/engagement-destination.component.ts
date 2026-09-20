import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { SubscriptionEngagementService } from '@main/shared/engagement/subscription-engagement.service';
import { StorageAddonCheckoutRequest, SubscriptionCheckoutIntentService } from './services/subscription-checkout-intent.service';

@Component({
  selector: 'app-engagement-destination',
  template: `<main class="gh-engagement-destination">
    <a routerLink="/recruiter/subscription">← Subscription &amp; Billing</a>
    <ng-container *ngIf="enterprise; else storage">
      <p class="eyebrow">Enterprise</p><h1>Plan your hiring capacity with GetHired</h1>
      <p>Discuss your hiring needs, team structure and required features with GetHired.</p>
      <a class="action" href="mailto:support@gethired.ph?subject=GetHired%20Enterprise%20enquiry">Contact GetHired</a>
      <p class="detail">This opens an email draft for you to review and send.</p>
    </ng-container>
    <ng-template #storage>
      <p class="eyebrow">Recruitment Storage</p><h1>Review your storage</h1>
      <ng-container *ngIf="storage$ | async as usage; else unavailable">
        <p class="usage">{{ usage.used / 1000000000 | number:'1.0-1' }} GB of {{ usage.limit / 1000000000 | number:'1.0-1' }} GB used</p>
        <div class="progress" role="progressbar" aria-label="Recruitment Storage usage" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="boundedPercent(usage.percentage)"><span [style.width.%]="boundedPercent(usage.percentage)"></span></div>
      </ng-container>
      <ng-template #unavailable><p role="status">Storage usage is not currently available. Refresh later or contact GetHired for help.</p></ng-template>
      <p>Review candidate media from your Applicants workspace, or compare the capacity available on your plans.</p>
      <div class="actions"><a class="action" routerLink="/recruiter/applicants">Review Applicants</a><a class="action secondary" routerLink="/recruiter/subscription">Compare Plans</a><button type="button" class="action secondary" (click)="refresh()">Refresh Usage</button></div>
      <h2>Add storage</h2><p>Choose additional Recruitment Storage. The exact amount due is confirmed by GetHired before PayMongo checkout.</p>
      <div class="actions" aria-label="Storage add-on packages">
        <button type="button" class="action secondary" [disabled]="checkoutBusy" (click)="addStorage('storage_25')">Add 25 GB</button>
        <button type="button" class="action secondary" [disabled]="checkoutBusy" (click)="addStorage('storage_100')">Add 100 GB</button>
        <button type="button" class="action secondary" [disabled]="checkoutBusy" (click)="addStorage('storage_250')">Add 250 GB</button>
      </div>
      <p *ngIf="checkoutBusy" role="status">Preparing secure checkout…</p><p *ngIf="checkoutError" role="alert">{{ checkoutError }}</p>
      <p class="detail">Capacity updates after payment is confirmed. For help removing stored media, contact GetHired support.</p>
    </ng-template>
  </main>`,
  styles:[`
    .gh-engagement-destination { max-width:900px; margin:24px auto; padding:24px; color:var(--gh-navy); background:#fff; border:1px solid var(--gh-border); border-radius:16px; }
    h1 {font-size:26px; margin:8px 0 16px;} p {line-height:1.6;} .eyebrow {font-size:12px; text-transform:uppercase; margin-top:24px; font-weight:700;}
    .actions {display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;} .action {display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border:1px solid var(--gh-coral);border-radius:10px;background:var(--gh-coral);color:#fff;text-decoration:none;font-weight:600;}
    .secondary {background:#fff;color:var(--gh-navy);border-color:var(--gh-border);} .detail {font-size:12px;color:var(--gh-text-secondary,#4b5563);margin-top:16px;} .usage {font-size:22px;font-weight:700;}
    .progress {height:8px; background:var(--gh-border);border-radius:8px;overflow:hidden;} .progress span {background:var(--gh-coral);height:100%;display:block;} a:focus-visible,button:focus-visible {outline:2px solid var(--gh-navy);outline-offset:3px;}
    @media(max-width:767px){.gh-engagement-destination{margin:12px;padding:18px;}h1{font-size:23px;} .actions>*{width:100%;}}
  `],changeDetection:ChangeDetectionStrategy.OnPush,
})
export class EngagementDestinationComponent {
  checkoutBusy = false;
  checkoutError: string | null = null;
  private readonly isBrowser: boolean;
  readonly enterprise = this.route.snapshot.data['engagementDestination'] === 'enterprise';
  readonly storage$ = this.engagement.context$.pipe(map(context => {
    const message = context?.banner || context?.dashboardCard;
    const usage = message?.meter === 'storage' ? message.usage : null;
    return usage && usage.unit === 'BYTES' && Number.isFinite(usage.used) && Number.isFinite(usage.limit) && Number.isFinite(usage.percentage) ? usage : null;
  }));
  constructor(private route:ActivatedRoute, private engagement:SubscriptionEngagementService, private checkout:SubscriptionCheckoutIntentService,
    private cdr:ChangeDetectorRef, @Inject(PLATFORM_ID) platformId:object){ this.isBrowser = isPlatformBrowser(platformId); }
  boundedPercent(value:number):number {return Math.max(0,Math.min(100,value));}
  refresh():void {this.engagement.refresh();}
  addStorage(packageCode: StorageAddonCheckoutRequest['packageCode']): void {
    if (this.checkoutBusy) { return; }
    this.checkoutBusy = true; this.checkoutError = null;
    const idempotencyKey = this.storageIdempotencyKey(packageCode);
    this.checkout.createStorageAddonCheckout({packageCode, billingCycle:'monthly', idempotencyKey}).subscribe({
      next: response => {
        this.checkoutBusy = false;
        if (response.success === true && response.paymentAttemptId && response.checkoutUrl && this.isBrowser && this.safeCheckoutUrl(response.checkoutUrl)) {
          sessionStorage.setItem('gethired.paymentAttemptId', response.paymentAttemptId);
          sessionStorage.removeItem(`gethired.storageCheckoutKey.${packageCode}`);
          window.location.assign(response.checkoutUrl);
        } else { this.checkoutError = 'We could not prepare storage checkout. Please try again.'; }
        this.cdr.markForCheck();
      },
      error: error => { this.checkoutBusy = false; this.checkoutError = error?.error?.code === 'ADDON_ALREADY_ACTIVE' ? 'That storage package is already active.' : 'Storage checkout is temporarily unavailable.'; this.cdr.markForCheck(); },
    });
  }
  private safeCheckoutUrl(value:string):boolean {try{return new URL(value).protocol==='https:';}catch(_){return false;}}
  private idempotencyKey():string {const bytes=new Uint8Array(16); if(this.isBrowser&&window.crypto?.getRandomValues){window.crypto.getRandomValues(bytes);return Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join('');} return `storage_${Date.now()}_${Math.random().toString(36).slice(2)}`;}
  private storageIdempotencyKey(packageCode:StorageAddonCheckoutRequest['packageCode']):string {if(!this.isBrowser){return this.idempotencyKey();} const name=`gethired.storageCheckoutKey.${packageCode}`;const existing=sessionStorage.getItem(name);if(existing){return existing;}const created=this.idempotencyKey();sessionStorage.setItem(name,created);return created;}
}
