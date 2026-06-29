import { Injectable } from '@angular/core';

/**
 * Session-scoped prompt cooldown.
 * Hard-limit and payment-critical prompts are never dismissed.
 * Backlog: persist dismissed state to backend per billing period.
 */
@Injectable({ providedIn: 'root' })
export class UpgradePromptCooldownService {
  // promptKey → ISO timestamp of last shown
  private sessionShown: Map<string, number> = new Map();
  // promptKey → true if dismissed this session (non-critical only)
  private sessionDismissed: Set<string> = new Set();

  // Hard-limit and payment-critical prompts cannot be dismissed
  private readonly NON_DISMISSIBLE = [
    'active_job_limit', 'admin_limit', 'video_response_limit',
    'trial_expired', 'payment_failed', 'past_due', 'grace_period',
  ];

  // Non-critical cooldown: 1 per session
  private readonly SESSION_ONCE_TRIGGERS = [
    'active_job_near_70', 'video_near_70', 'active_job_near_90', 'video_near_90',
    'annual_savings_prompt', 'annual_savings_general', 'general_upgrade',
    'first_applicant', 'first_video_response',
  ];

  shouldShow(trigger: string, priority: number): boolean {
    if (this.isNonDismissible(trigger)) return true;
    if (this.sessionDismissed.has(trigger)) return false;
    if (this.SESSION_ONCE_TRIGGERS.indexOf(trigger) !== -1) {
      return !this.sessionShown.has(trigger);
    }
    return true;
  }

  markShown(trigger: string): void {
    this.sessionShown.set(trigger, Date.now());
  }

  dismiss(trigger: string): void {
    if (!this.isNonDismissible(trigger)) {
      this.sessionDismissed.add(trigger);
    }
  }

  isNonDismissible(trigger: string): boolean {
    return this.NON_DISMISSIBLE.indexOf(trigger) !== -1;
  }

  // Pricing page: always show regardless of cooldown
  isFromPricingPage(surface: string): boolean {
    return surface === 'subscription_page' || surface === 'upgrade_landing';
  }
}
