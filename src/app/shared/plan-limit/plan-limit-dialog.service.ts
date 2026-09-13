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
      { data: refusal, width: '480px', maxWidth: '92vw', autoFocus: true, restoreFocus: true },
    ).afterClosed();
  }
}
