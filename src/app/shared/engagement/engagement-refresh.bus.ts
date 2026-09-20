import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Why the engagement context must be read again: contract §3.1, plus a bell read (F0 D5).
 *
 * An upgrade or a downgrade reaches the frontend as a checkout return. The frontend has no
 * payment-method update yet (UPDATE_PAYMENT_METHOD is E4), so that trigger has no call site.
 */
export type EngagementRefreshReason =
  | 'account_refresh'
  | 'checkout_return'
  | 'job_status_changed'
  | 'job_deleted'
  | 'member_removed'
  | 'message_dismissed'
  | 'message_clicked'
  | 'bell_read'
  | 'bell_dismissed';

/**
 * Where the refetch triggers meet the engagement context. It has no dependencies, so the job
 * effects, the team screen, the checkout return and the bell can each announce a change without
 * pulling in HTTP or the router. A request made while nothing reads the context does nothing.
 */
@Injectable({ providedIn: 'root' })
export class EngagementRefreshBus {
  private readonly requests = new Subject<EngagementRefreshReason>();

  readonly requests$: Observable<EngagementRefreshReason> = this.requests.asObservable();

  request(reason: EngagementRefreshReason): void {
    this.requests.next(reason);
  }
}
