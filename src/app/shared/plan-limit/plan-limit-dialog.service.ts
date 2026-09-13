import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SubscriptionLimitModalComponent } from '@main/employer-panel/employer-subscription/components/subscription-limit-modal/subscription-limit-modal.component';
import { EmployerPlanLimitRefusal, PlanLimitChoice } from './plan-limit-refusal';

/**
 * Opens the subscription limit modal for a plan-limit refusal and reports what the employer
 * chose. The screen that made the request opens it, because only that screen can act on
 * the choice: "Save as draft" has to save that screen's own work.
 */
@Injectable({ providedIn: 'root' })
export class PlanLimitDialogService {
  constructor(private dialog: MatDialog) {}

  open(refusal: EmployerPlanLimitRefusal): Observable<PlanLimitChoice | undefined> {
    return this.dialog.open<SubscriptionLimitModalComponent, EmployerPlanLimitRefusal, PlanLimitChoice>(
      SubscriptionLimitModalComponent,
      // First focus on the heading that names the dialog, so it is read before any control,
      // rather than on the first tabbable element, which is "Close dialog".
      { data: refusal, width: '480px', maxWidth: '92vw', autoFocus: 'first-heading', restoreFocus: true },
    ).afterClosed();
  }
}
