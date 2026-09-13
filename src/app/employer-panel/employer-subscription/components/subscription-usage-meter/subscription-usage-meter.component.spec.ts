import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EntitlementUsageV4, RecruitmentStorageUsageV4, StorageStatus } from '../../subscription-v4.models';
import { STORAGE_NOTES, STORAGE_UNAVAILABLE_NOTE, SubscriptionUsageMeterComponent } from './subscription-usage-meter.component';

/**
 * B3: the Recruitment Storage meter shows the band the backend sends and nothing it
 * works out for itself. The blocks below take the exact shape of
 * `usage.recruitment_storage` on GET /api/subscriptions/employer/summary (A2): bytes,
 * the backend's percentUsed, and storageStatus, null while storage cannot be counted.
 */
const GB = 1024 * 1024 * 1024;

function block(over: Partial<RecruitmentStorageUsageV4>): RecruitmentStorageUsageV4 {
  return {
    key: 'recruitment_storage', used: 20 * GB, limit: 50 * GB, remaining: 30 * GB, percentUsed: 40,
    warningLevel: 'none', storageStatus: 'normal', countSource: 'stored_media.active', countConfidence: 'confirmed',
    ...over,
  };
}

@Component({
  template: `<app-subscription-usage-meter [label]="label" [kind]="kind" [usage]="usage"></app-subscription-usage-meter>`,
})
class HostComponent {
  label = 'Recruitment Storage';
  kind: 'count' | 'storage' = 'storage';
  usage: EntitlementUsageV4 | RecruitmentStorageUsageV4 | null = null;
}

describe('SubscriptionUsageMeterComponent -- Recruitment Storage states (B3)', () => {
  let fixture: ComponentFixture<HostComponent>;

  /** Call inside fakeAsync: the fill animates in after 60ms. */
  function render(usage: EntitlementUsageV4 | RecruitmentStorageUsageV4, kind: 'count' | 'storage' = 'storage', label?: string): void {
    TestBed.configureTestingModule({ declarations: [HostComponent, SubscriptionUsageMeterComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.kind = kind;
    fixture.componentInstance.usage = usage;
    if (label) { fixture.componentInstance.label = label; }
    fixture.detectChanges();
    tick(60);
    fixture.detectChanges();
  }

  const text = () => (fixture.nativeElement.textContent || '').replace(/\s+/g, ' ').trim();
  const find = (css: string) => fixture.debugElement.query(By.css(css));

  const STATES: Array<{ status: StorageStatus; band: string; usedGb: number; percent: number; fill: string; note: string | null }> = [
    { status: 'normal', band: 'below 70%', usedGb: 20, percent: 40, fill: 'usage-meter__fill--healthy', note: null },
    { status: 'notice', band: '70%', usedGb: 37, percent: 74, fill: 'usage-meter__fill--caution', note: 'at least 70%' },
    { status: 'warning', band: '80%', usedGb: 40, percent: 80, fill: 'usage-meter__fill--warning', note: 'at least 80%' },
    { status: 'critical', band: '90%', usedGb: 46, percent: 92, fill: 'usage-meter__fill--critical', note: 'at least 90%' },
    { status: 'full', band: '100%', usedGb: 50, percent: 100, fill: 'usage-meter__fill--critical', note: 'stay safe' },
  ];

  STATES.forEach(state => {
    it(`${state.status} (${state.band}): shows bytes as GB, fills to the backend's percentage and ${state.note ? 'explains the band' : 'adds no note'}`, fakeAsync(() => {
      render(block({
        used: state.usedGb * GB, remaining: (50 - state.usedGb) * GB, percentUsed: state.percent, storageStatus: state.status,
        warningLevel: state.percent >= 100 ? 'at_limit' : state.percent >= 90 ? 'near_90' : state.percent >= 70 ? 'near_70' : 'none',
      }));
      expect(text()).toContain(`${state.usedGb} GB / 50 GB`);
      const fill: HTMLElement = find('.usage-meter__fill').nativeElement;
      expect(fill.classList).toContain(state.fill);
      expect(fill.style.width).toBe(`${state.percent}%`);
      const track: HTMLElement = find('.usage-meter__track').nativeElement;
      expect(track.getAttribute('aria-valuenow')).toBe(String(state.percent));
      expect(track.getAttribute('aria-valuetext')).toBe(`${state.usedGb} GB of 50 GB`);
      const note = find('.usage-meter__note');
      if (state.note === null) {
        expect(note).toBeNull();
      } else {
        expect(note.nativeElement.textContent).toContain(state.note);
        expect(note.nativeElement.getAttribute('role')).toBe('status');
      }
    }));
  });

  it('full: says existing applications stay safe', fakeAsync(() => {
    render(block({ used: 200 * GB, limit: 200 * GB, remaining: 0, percentUsed: 100, warningLevel: 'at_limit', storageStatus: 'full' }));
    expect(find('.usage-meter__note').nativeElement.textContent).toContain('Your existing applications and candidate media stay safe');
  }));

  it('no copy for any band, or for an unavailable count, suggests anything received is removed', () => {
    const notes = [...Object.values(STORAGE_NOTES), STORAGE_UNAVAILABLE_NOTE].filter((n): n is string => !!n);
    expect(notes.length).toBe(5);
    notes.forEach(note => expect(note).not.toMatch(/delet|remov|eras|purg|lose|lost|wipe/i));
  });

  it('takes the band from storageStatus, never from its own thresholds', fakeAsync(() => {
    // 95% with a notice band: the meter must show what the backend decided.
    render(block({ used: 47.5 * GB, remaining: 2.5 * GB, percentUsed: 95, warningLevel: 'near_90', storageStatus: 'notice' }));
    expect(find('.usage-meter__fill').nativeElement.classList).toContain('usage-meter__fill--caution');
    expect(find('.usage-meter__note').nativeElement.textContent).toContain('at least 70%');
  }));

  it('an unavailable count shows no figures and no bar, never a confident 0 GB', fakeAsync(() => {
    render(block({ used: 0, remaining: 50 * GB, percentUsed: 0, warningLevel: 'none', storageStatus: null, countSource: 'unknown', countConfidence: 'unavailable' }));
    expect(find('.usage-meter__count')).toBeNull();
    expect(find('.usage-meter__track')).toBeNull();
    expect(text()).not.toContain('GB');
    expect(find('.usage-meter__note').nativeElement.textContent.trim()).toBe(STORAGE_UNAVAILABLE_NOTE);
  }));

  it('Enterprise (null limit) shows usage against custom capacity, with no bar and no note', fakeAsync(() => {
    render(block({ used: 600 * GB, limit: null, remaining: null, percentUsed: null, warningLevel: 'none', storageStatus: 'normal' }));
    expect(text()).toContain('600 GB / Custom');
    expect(find('.usage-meter__track')).toBeNull();
    expect(find('.usage-meter__note')).toBeNull();
  }));

  it('no plan (zero limit, full, no percentage) shows a full bar and the full note', fakeAsync(() => {
    render(block({ used: 0, limit: 0, remaining: 0, percentUsed: null, warningLevel: 'at_limit', storageStatus: 'full' }));
    expect(text()).toContain('0 GB / 0 GB');
    expect(find('.usage-meter__fill').nativeElement.style.width).toBe('100%');
    expect(find('.usage-meter__note').nativeElement.textContent).toContain('stay safe');
  }));

  // What 4c3412d sends when the count fails for an employer with no plan: storageStatus
  // null, confidence unavailable, a placeholder used of 0, and a zero limit whose
  // warningLevel reads at_limit.
  const UNAVAILABLE_NO_PLAN: Partial<RecruitmentStorageUsageV4> = {
    used: 0, limit: 0, remaining: 0, percentUsed: null, warningLevel: 'at_limit',
    storageStatus: null, countSource: 'stored_media.active', countConfidence: 'unavailable',
  };

  function expectUnavailableWithoutWarning(): void {
    const note = find('.usage-meter__note').nativeElement as HTMLElement;
    expect(note.textContent!.trim()).toBe('Storage usage unavailable.');
    expect(note.classList).toContain('usage-meter__note--unavailable');
    expect(find('.usage-meter__count')).toBeNull();
    expect(find('.usage-meter__track')).toBeNull();
    expect(find('.usage-meter__warning')).toBeNull();
    expect(text()).not.toMatch(/\d\s*GB/);
    const banded = fixture.nativeElement.querySelectorAll(
      '[class*="--notice"], [class*="--caution"], [class*="--warning"], [class*="--critical"], [class*="--full"]');
    expect(banded.length).withContext('an unavailable meter carries a warning-state class').toBe(0);
    expect(find('.usage-meter').nativeElement.getAttribute('aria-label')).toBe('Recruitment Storage: usage unavailable');
  }

  it('unavailable renders "Storage usage unavailable" with no warning state, even when warningLevel reads at_limit', fakeAsync(() => {
    render(block(UNAVAILABLE_NO_PLAN));
    expectUnavailableWithoutWarning();
  }));

  it('a count the backend did not confirm is unavailable even if the block carries a band', fakeAsync(() => {
    render(block({ ...UNAVAILABLE_NO_PLAN, limit: 50 * GB, remaining: 50 * GB, percentUsed: 0, warningLevel: 'none', storageStatus: 'full' }));
    expectUnavailableWithoutWarning();
  }));

  // The page's sibling usage bar (employer-subscription.component.scss .gh-usage-meter).
  const SIBLING_FILL: Record<StorageStatus, string> = {
    normal: 'rgb(16, 185, 129)', notice: 'rgb(245, 158, 11)', warning: 'rgb(245, 158, 11)',
    critical: 'rgb(239, 68, 68)', full: 'rgb(239, 68, 68)',
  };

  STATES.forEach(state => {
    it(`${state.status}: a static sibling-card bar (--gh-border track, ${SIBLING_FILL[state.status]} fill, no glow) and no endless animation`, fakeAsync(() => {
      render(block({ used: state.usedGb * GB, remaining: (50 - state.usedGb) * GB, percentUsed: state.percent, storageStatus: state.status }));
      const fill = getComputedStyle(find('.usage-meter__fill').nativeElement);
      expect(fill.backgroundColor).toBe(SIBLING_FILL[state.status]);
      expect(fill.boxShadow).toBe('none');
      expect(fill.animationName).toBe('none');
      expect(fill.animationIterationCount).not.toBe('infinite');
      expect(getComputedStyle(find('.usage-meter__track').nativeElement).backgroundColor).toBe('rgb(231, 234, 243)');
    }));
  });

  (['near_90', 'at_limit'] as const).forEach(level => {
    it(`count mode at ${level} runs no endless animation either`, fakeAsync(() => {
      render({ key: 'active_job_posts', used: level === 'at_limit' ? 10 : 9, limit: 10, remaining: level === 'at_limit' ? 0 : 1,
        percentUsed: level === 'at_limit' ? 100 : 90, warningLevel: level, countSource: 'jobs.status', countConfidence: 'confirmed' }, 'count', 'Active job posts');
      const fill = getComputedStyle(find('.usage-meter__fill').nativeElement);
      expect(fill.animationName).toBe('none');
      expect(fill.animationIterationCount).not.toBe('infinite');
    }));
  });

  it('count mode is unchanged: raw counts, its own warning, no storage note', fakeAsync(() => {
    render({ key: 'active_job_posts', used: 9, limit: 10, remaining: 1, percentUsed: 90, warningLevel: 'near_90', countSource: 'jobs.status', countConfidence: 'confirmed' },
      'count', 'Active job posts');
    expect(text()).toContain('9 / 10');
    expect(text()).toContain('Approaching limit.');
    const track: HTMLElement = find('.usage-meter__track').nativeElement;
    expect(track.getAttribute('aria-valuenow')).toBe('9');
    expect(track.getAttribute('aria-valuemax')).toBe('10');
    expect(track.hasAttribute('aria-valuetext')).toBeFalse();
    expect(find('.usage-meter__fill').nativeElement.style.width).toBe('90%');
    expect(find('.usage-meter__note')).toBeNull();
    expect(find('.usage-meter').nativeElement.getAttribute('aria-label')).toBe('Active job posts: 9 of 10 used');
  }));
});
