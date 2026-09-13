import { TestBed } from '@angular/core/testing';
import { TrialDaysRemainingBadgeComponent, trialBadgeText } from './trial-days-remaining-badge.component';

/** F4: the badge tells the served days left and does no date math. */
describe('TrialDaysRemainingBadgeComponent -- the served days left, no date math (F4)', () => {
  it('says the served number, the last day, or that the trial ended; an unusable figure says nothing', () => {
    expect(trialBadgeText('trialing', 4)).toBe('4 days left in your free trial');
    expect(trialBadgeText('trial_ending', 1)).toBe('1 day left in your free trial');
    expect(trialBadgeText('trial_ending', 0)).toBe('Your free trial ends today');
    expect(trialBadgeText('trial_expired', 0)).toBe('Your free trial has ended');
    expect(trialBadgeText('trial_expired', null)).toBe('Your free trial has ended');
    expect(trialBadgeText('trialing', null)).toBeNull();
    expect(trialBadgeText('trialing', -1)).toBeNull();
    expect(trialBadgeText(null, 3)).toBeNull();
  });

  it('renders as a status, urgent at 2 days or fewer and once expired, and not before', () => {
    TestBed.configureTestingModule({ declarations: [TrialDaysRemainingBadgeComponent] });
    const fixture = TestBed.createComponent(TrialDaysRemainingBadgeComponent);
    const badge = (): HTMLElement => fixture.nativeElement.querySelector('.trial-badge');
    fixture.componentInstance.status = 'trialing';
    fixture.componentInstance.daysRemaining = 5;
    fixture.detectChanges();
    expect(badge().getAttribute('role')).toBe('status');
    expect(badge().classList).not.toContain('trial-badge--urgent');
    fixture.componentInstance.daysRemaining = 2;
    fixture.detectChanges();
    expect(badge().classList).toContain('trial-badge--urgent');
    fixture.componentInstance.status = 'trial_expired';
    fixture.componentInstance.daysRemaining = 0;
    fixture.detectChanges();
    expect(badge().classList).toContain('trial-badge--urgent');
    expect(badge().textContent!.trim()).toBe('Your free trial has ended');
  });
});
