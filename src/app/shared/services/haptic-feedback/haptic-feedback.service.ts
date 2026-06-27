import { Injectable } from '@angular/core';

/**
 * Optional, progressive-enhancement-only haptic feedback (BRAND).
 *
 * Fails silently if navigator.vibrate is unsupported -- never throws, never
 * required for understanding. Must only be called after a real
 * user-initiated action, paired with visible feedback, and never on page
 * load, low scores, rejection-like states, or to pressure
 * applying/uploading/paying. See GETHIRED_BRAND_HAPTICS_SPEC.md for the
 * full allowed/forbidden list.
 */
@Injectable({ providedIn: 'root' })
export class HapticFeedbackService {
  private enabled = true;

  canVibrate(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  selection(): void {
    this.vibrate([8]);
  }

  press(): void {
    this.vibrate([6]);
  }

  success(): void {
    this.vibrate([12]);
  }

  warning(): void {
    this.vibrate([20]);
  }

  error(): void {
    this.vibrate([30]);
  }

  uploadComplete(): void {
    this.vibrate([10, 20, 10]);
  }

  scanComplete(): void {
    this.vibrate([8, 20, 8]);
  }

  actionComplete(): void {
    this.vibrate([8, 30, 8]);
  }

  applicationSubmitted(): void {
    this.vibrate([12, 30, 12]);
  }

  jobPublished(): void {
    this.vibrate([12, 30, 12]);
  }

  /** Employer dashboard action card tapped (user-initiated). */
  dashboardAction(): void {
    this.vibrate([8]);
  }

  /** Plan health CTA tapped (user-initiated). */
  planAction(): void {
    this.vibrate([8]);
  }

  /**
   * Returns true if the user has requested reduced motion.
   * When true, haptic feedback is suppressed — reduced-motion preference
   * signals sensory sensitivity that may extend to vibration.
   */
  respectReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private vibrate(pattern: number[]): void {
    if (!this.enabled || !this.canVibrate()) {
      return;
    }
    if (this.respectReducedMotion()) {
      return;
    }
    try {
      navigator.vibrate(pattern);
    } catch {
      // Never throw -- haptics are optional, a failure here must never
      // break the calling code path.
    }
  }
}
