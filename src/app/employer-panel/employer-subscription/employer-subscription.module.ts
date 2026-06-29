import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app-shared/shared.module';

import { EmployerSubscriptionComponent } from './employer-subscription.component';
import { UpgradeAnnualFirstLandingComponent } from './upgrade/upgrade-annual-first-landing.component';

// Components
import { SubscriptionStatusChipComponent } from './components/subscription-status-chip/subscription-status-chip.component';
import { TrialDaysRemainingBadgeComponent } from './components/trial-days-remaining-badge/trial-days-remaining-badge.component';
import { SubscriptionUsageMeterComponent } from './components/subscription-usage-meter/subscription-usage-meter.component';
import { SubscriptionStatusBannerComponent } from './components/subscription-status-banner/subscription-status-banner.component';
import { SubscriptionLimitModalComponent } from './components/subscription-limit-modal/subscription-limit-modal.component';

// Services
import { SubscriptionSummaryService } from './subscription-summary.service';
import { SubscriptionPricingCatalogService } from './services/subscription-pricing-catalog.service';
import { SubscriptionGuardrailService } from './services/subscription-guardrail.service';
import { SubscriptionCheckoutIntentService } from './services/subscription-checkout-intent.service';

const routes: Routes = [
  { path: '', component: EmployerSubscriptionComponent },
  { path: 'upgrade/:planSlug', component: UpgradeAnnualFirstLandingComponent },
];

@NgModule({
  declarations: [
    EmployerSubscriptionComponent,
    UpgradeAnnualFirstLandingComponent,
    SubscriptionStatusChipComponent,
    TrialDaysRemainingBadgeComponent,
    SubscriptionUsageMeterComponent,
    SubscriptionStatusBannerComponent,
    SubscriptionLimitModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    SubscriptionSummaryService,
    SubscriptionPricingCatalogService,
    SubscriptionGuardrailService,
    SubscriptionCheckoutIntentService,
  ],
  entryComponents: [
    SubscriptionLimitModalComponent,
  ],
})
export class EmployerSubscriptionModule { }
