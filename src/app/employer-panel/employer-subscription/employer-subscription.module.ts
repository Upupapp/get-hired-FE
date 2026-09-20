import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '@app-shared/shared.module';

import { EmployerSubscriptionComponent } from './employer-subscription.component';
import { UpgradeAnnualFirstLandingComponent } from './upgrade/upgrade-annual-first-landing.component';

// Components
import { SubscriptionStatusChipComponent } from './components/subscription-status-chip/subscription-status-chip.component';
import { SubscriptionLimitModalComponent } from './components/subscription-limit-modal/subscription-limit-modal.component';
import { EngagementDestinationComponent } from './engagement-destination.component';
import { CheckoutReturnStatusComponent } from './components/checkout-return-status/checkout-return-status.component';
import { BillingStatusBannerComponent } from './components/billing-status-banner/billing-status-banner.component';
import { EngagementUiModule } from '@main/shared/engagement/engagement-ui.module';
import { PlanComparisonStripComponent } from './components/plan-comparison-strip/plan-comparison-strip.component';

// Invoice Vault components
import { InvoiceStatusChipComponent } from './components/invoice-status-chip/invoice-status-chip.component';
import { InvoiceDetailDrawerComponent } from './components/invoice-detail-drawer/invoice-detail-drawer.component';
import { InvoiceSendModalComponent } from './components/invoice-send-modal/invoice-send-modal.component';
import { BillingProfileComponent } from './components/billing-profile/billing-profile.component';

// Services
import { SubscriptionSummaryService } from './subscription-summary.service';
import { SubscriptionPricingCatalogService } from './services/subscription-pricing-catalog.service';
import { SubscriptionGuardrailService } from './services/subscription-guardrail.service';
import { SubscriptionCheckoutIntentService } from './services/subscription-checkout-intent.service';
import { SubscriptionLifecycleService } from './services/subscription-lifecycle.service';
import { SubscriptionUpgradeRecommendationService } from './services/subscription-upgrade-recommendation.service';
import { UpgradePromptCooldownService } from './services/upgrade-prompt-cooldown.service';
import { BillingService } from './services/billing.service';

const routes: Routes = [
  { path: '', component: EmployerSubscriptionComponent },
  { path: 'storage', component: EngagementDestinationComponent, data: {engagementDestination: 'storage'} },
  { path: 'enterprise', component: EngagementDestinationComponent, data: {engagementDestination: 'enterprise'} },
  { path: 'upgrade/:planSlug', component: UpgradeAnnualFirstLandingComponent },
  { path: 'checkout-return', component: CheckoutReturnStatusComponent },
];

@NgModule({
  declarations: [
    EngagementDestinationComponent,
    EmployerSubscriptionComponent,
    UpgradeAnnualFirstLandingComponent,
    SubscriptionStatusChipComponent,
    SubscriptionLimitModalComponent,
    CheckoutReturnStatusComponent,
    BillingStatusBannerComponent,
    PlanComparisonStripComponent,
    // Invoice Vault
    InvoiceStatusChipComponent,
    InvoiceDetailDrawerComponent,
    InvoiceSendModalComponent,
    BillingProfileComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    // F2: the banner and card are declared there, so the employer shell can render them too.
    EngagementUiModule,
    ReactiveFormsModule,
    MatDialogModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    SubscriptionSummaryService,
    SubscriptionPricingCatalogService,
    SubscriptionGuardrailService,
    SubscriptionCheckoutIntentService,
    SubscriptionLifecycleService,
    SubscriptionUpgradeRecommendationService,
    UpgradePromptCooldownService,
    BillingService,
  ],
  entryComponents: [
    SubscriptionLimitModalComponent,
    InvoiceSendModalComponent,
  ],
})
export class EmployerSubscriptionModule { }
