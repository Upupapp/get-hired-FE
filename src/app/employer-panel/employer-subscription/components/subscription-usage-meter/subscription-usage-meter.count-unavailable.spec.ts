import { TestBed } from '@angular/core/testing';
import { E2_USAGE_CONFIRMED, E2_USAGE_UNCONFIRMED } from '../../../../../testing/engagement-e2-trial.fixture';
import { EntitlementUsageV4 } from '../../subscription-v4.models';
import { COUNT_UNAVAILABLE_NOTE, SubscriptionUsageMeterComponent } from './subscription-usage-meter.component';

/** F4: a count the backend did not confirm is unmeasured, not zero (contract §4.1). */
describe('SubscriptionUsageMeterComponent -- a count the backend did not confirm (F4)', () => {
  function render(usage: EntitlementUsageV4, label: string): HTMLElement {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ declarations: [SubscriptionUsageMeterComponent] });
    const fixture = TestBed.createComponent(SubscriptionUsageMeterComponent);
    fixture.componentInstance.kind = 'count';
    fixture.componentInstance.label = label;
    fixture.componentInstance.usage = usage;
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('countConfidence other than confirmed (unavailable, error, no read) renders unavailable: no figure, no bar, no warning, never 0', () => {
    const unconfirmed: Array<[string, EntitlementUsageV4]> = [
      ['active_job_posts, unavailable', E2_USAGE_UNCONFIRMED.active_job_posts!],
      ['admin_users, error', E2_USAGE_UNCONFIRMED.admin_users!],
      ['video_responses, never read', E2_USAGE_UNCONFIRMED.video_responses!],
    ];
    unconfirmed.forEach(([where, usage]) => {
      expect(usage.countConfidence).withContext(where).not.toBe('confirmed');
      const root = render(usage, 'Active jobs');
      expect(root.querySelector('.usage-meter__count')).withContext(where).toBeNull();
      expect(root.querySelector('.usage-meter__track')).withContext(where).toBeNull();
      expect(root.querySelector('.usage-meter__warning')).withContext(where).toBeNull();
      expect(root.querySelector('.usage-meter__note--unavailable')!.textContent!.trim()).withContext(where).toBe(COUNT_UNAVAILABLE_NOTE);
      expect(root.querySelector('.usage-meter')!.getAttribute('aria-label')).withContext(where).toBe('Active jobs: usage unavailable');
    });
  });

  it('a confirmed count still shows its figure and bar (control)', () => {
    const root = render(E2_USAGE_CONFIRMED.active_job_posts!, 'Active jobs');
    expect(root.querySelector('.usage-meter__count')!.textContent).toContain('1');
    expect(root.querySelector('.usage-meter__track')).not.toBeNull();
    expect(root.querySelector('.usage-meter__note--unavailable')).toBeNull();
  });
});
