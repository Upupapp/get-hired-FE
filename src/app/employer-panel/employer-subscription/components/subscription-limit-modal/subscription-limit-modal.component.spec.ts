import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EmployerPlanLimitRefusal } from '@main/shared/plan-limit/plan-limit-refusal';
import { SubscriptionLimitModalComponent } from './subscription-limit-modal.component';
import { EMPLOYER_REFUSAL } from '../../../../../testing/plan-limit-refusal.fixture';

describe('SubscriptionLimitModalComponent -- renders gh-be A3\'s employer refusal (B5)', () => {
  let close: jasmine.Spy;
  let router: jasmine.SpyObj<Router>;

  function render(refusal: EmployerPlanLimitRefusal): ComponentFixture<SubscriptionLimitModalComponent> {
    close = jasmine.createSpy('close');
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [SubscriptionLimitModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: refusal },
        { provide: MatDialogRef, useValue: { close } },
        { provide: Router, useValue: router },
      ],
    });
    const fixture = TestBed.createComponent(SubscriptionLimitModalComponent);
    fixture.detectChanges();
    return fixture;
  }

  const textOf = (fixture: ComponentFixture<SubscriptionLimitModalComponent>, css: string): string => {
    const el = fixture.nativeElement.querySelector(css);
    return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
  };
  const buttons = (fixture: ComponentFixture<SubscriptionLimitModalComponent>): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.limit-modal__actions button'));
  const labels = (fixture: ComponentFixture<SubscriptionLimitModalComponent>): string[] =>
    buttons(fixture).map(b => (b.textContent || '').replace(/\s+/g, ' ').trim());

  it('renders the refusal as the backend sent it: title, message, usage, and what the recommended plan unlocks', () => {
    const fixture = render(EMPLOYER_REFUSAL);
    expect(textOf(fixture, '.limit-modal__title')).toBe('Active job posts limit reached');
    expect(textOf(fixture, '.limit-modal__message')).toBe(EMPLOYER_REFUSAL.userMessage);
    // Two spans laid out apart by CSS; Angular strips the whitespace between them, so read each.
    const meter = Array.from(fixture.nativeElement.querySelectorAll('.limit-modal__meter-label span'))
      .map((span: any) => (span.textContent || '').trim());
    expect(meter).toEqual(['1 used', '1 included']);
    expect(textOf(fixture, '.limit-modal__unlocks-label')).toBe('Starter plan includes:');
    const unlocks = Array.from(fixture.nativeElement.querySelectorAll('.limit-modal__unlocks-list li'))
      .map((li: any) => (li.textContent || '').trim());
    expect(unlocks).toEqual(EMPLOYER_REFUSAL.unlocks);
    expect(labels(fixture)).toEqual(['Upgrade to Starter', 'Save as draft']);
  });

  it('never says the work was saved: the refused publish saved nothing (draftSaved false)', () => {
    const fixture = render(EMPLOYER_REFUSAL);
    expect(fixture.nativeElement.querySelector('.limit-modal__preserve')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('has been saved');
  });

  it('Upgrade closes with "upgrade" and opens the recommended plan\'s upgrade route', () => {
    const fixture = render(EMPLOYER_REFUSAL);
    buttons(fixture)[0].click();
    expect(close).toHaveBeenCalledOnceWith('upgrade');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/recruiter/subscription/upgrade/starter');
  });

  it('Save as draft closes with "draft" and navigates nowhere, leaving the draft to the screen that opened it', () => {
    const fixture = render(EMPLOYER_REFUSAL);
    buttons(fixture)[1].click();
    expect(close).toHaveBeenCalledOnceWith('draft');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('offers no draft for an action that cannot be one, only Close', () => {
    const fixture = render({ ...EMPLOYER_REFUSAL, entitlementKey: 'admin_users', limitCode: 'EMPLOYER_USER_LIMIT_REACHED',
      preserveWork: { canSaveDraft: false, draftSaved: false } });
    expect(textOf(fixture, '.limit-modal__title')).toBe('Team members limit reached');
    expect(labels(fixture)).toEqual(['Upgrade to Starter', 'Close']);
  });

  it('with no self-serve plan that fits, sends the employer to the plans page instead of an upgrade', () => {
    const fixture = render({ ...EMPLOYER_REFUSAL, contactSalesRequired: true, upgradeRoute: '/recruiter/subscription',
      recommendedPlanSlug: null, recommendedPlanName: null, unlocks: [] });
    expect(fixture.nativeElement.querySelector('.limit-modal__unlocks')).toBeNull();
    expect(labels(fixture)[0]).toBe('View plans');
    buttons(fixture)[0].click();
    expect(close).toHaveBeenCalledOnceWith('plans');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/recruiter/subscription');
  });
});
