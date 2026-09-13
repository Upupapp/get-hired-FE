import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CoreService } from '@app-core/services/core.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { JobFacade } from '@app-job/state/job.facade';
import { SubscriptionUpgradeRecommendationService } from '@main/employer-panel/employer-subscription/services/subscription-upgrade-recommendation.service';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';
import { TalentProofService } from '@main/public/services/talent-proof.service';
import { EngagementContext } from '@main/shared/engagement/engagement-contract.models';
import { EngagementFeatureLockComponent } from '@main/shared/engagement/engagement-feature-lock.component';
import { SubscriptionEngagementService } from '@main/shared/engagement/subscription-engagement.service';
import { HapticFeedbackService } from '@main/shared/services/haptic-feedback/haptic-feedback.service';
import { ENGAGEMENT_CONTEXT_RESPONSE } from '../../../testing/engagement-contract.fixture';
import { E2_CAPABILITIES_NO_PLAN_OWNER } from '../../../testing/engagement-e2-capabilities.fixture';
import { EasyJobPostAssistantService } from '../easy-job-post-assistant/easy-job-post-assistant.service';
import { JobService } from '../job.service';
import { AiCreateDraftService } from '../services/ai-create-draft.service';
import { JobCreateRecoveryService } from '../services/job-create-recovery.service';
import { JobReadinessService } from '../services/job-readiness.service';
import { JobCreateComponent } from './job-create.component';

/**
 * F7 on job create's interview step (video_interview_questions). With no context the page renders as it did at
 * bef0985f; with the served lock, the interview questions step is still all there. The lock displays; it never blocks.
 * Like the stepper suite, ngOnInit's loads never run: the form is built by setFormGroup().
 */
describe('JobCreateComponent -- the interview step with the feature lock (F7)', () => {
  function page(declareLock: boolean, context: EngagementContext | null): HTMLElement {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: declareLock ? [JobCreateComponent, EngagementFeatureLockComponent] : [JobCreateComponent],
      imports: [NoopAnimationsModule],
      providers: [
        FormBuilder,
        {
          provide: JobFacade,
          useValue: {
            jobDetails$: of(null), subsRestrictions$: of(null), loading$: of(false),
            saveInitialForm: () => {}, saveJobInfo: () => {}, saveInterview: () => {}, getIndustry: () => {}, getJobRole: () => {}, resetFormState: () => {},
          },
        },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(undefined), close: () => {} }), closeAll: () => {} } },
        { provide: HapticFeedbackService, useValue: jasmine.createSpyObj('HapticFeedbackService', ['warning', 'success', 'selection', 'impact', 'error']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: SnackbarService, useValue: jasmine.createSpyObj('SnackbarService', ['success', 'error', 'warning', 'info']) },
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {}, markForCheck: () => {} } },
        { provide: TalentProofService, useValue: {} },
        { provide: PublicPortalAnalyticsService, useValue: jasmine.createSpyObj('PublicPortalAnalyticsService', ['trackHeroCTAClicked', 'trackFinalCTAClicked']) },
        { provide: JobReadinessService, useValue: { evaluate: () => null } },
        { provide: EasyJobPostAssistantService, useValue: { getExtractionResult: () => null } },
        { provide: AiCreateDraftService, useValue: jasmine.createSpyObj('AiCreateDraftService', ['save', 'load', 'clear', 'hasDraft']) },
        { provide: JobService, useValue: jasmine.createSpyObj('JobService', ['getJobLevels']) },
        { provide: JobCreateRecoveryService, useValue: jasmine.createSpyObj('JobCreateRecoveryService', ['save', 'load', 'clear']) },
        { provide: CoreService, useValue: { authState$: of(false) } },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: SubscriptionEngagementService, useValue: { context$: of(context) } },
        { provide: SubscriptionUpgradeRecommendationService, useValue: { recordEvent: jasmine.createSpy('recordEvent') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    // Angular calls the prototype's ngOnInit, so the loads are stubbed there (jasmine restores it after each spec).
    if (!jasmine.isSpy(JobCreateComponent.prototype.ngOnInit)) { spyOn(JobCreateComponent.prototype, 'ngOnInit'); }
    const fixture = TestBed.createComponent(JobCreateComponent);
    const component = fixture.componentInstance;
    component.postMode = 'comprehensive';
    component.setFormGroup();
    (component as any).loading = false;
    component.stepper = 3;
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.gh-jc-shell');
  }

  /** The page's text and element structure, leaving out the lock element and anything inside it. */
  function shape(root: HTMLElement): { text: string; tags: string[] } {
    const outside = Array.from(root.querySelectorAll('*')).filter(e => !e.closest('app-engagement-feature-lock'));
    const clone = root.cloneNode(true) as HTMLElement;
    Array.from(clone.querySelectorAll('app-engagement-feature-lock')).forEach(e => e.remove());
    return { text: (clone.textContent || '').replace(/\s+/g, ' ').trim(), tags: outside.map(e => e.tagName) };
  }

  it('with no context (a backend without E2), the interview step renders exactly as it does without the lock', () => {
    const withoutLock = page(false, null);
    expect(withoutLock.querySelector('app-create-interview-questions')).not.toBeNull();
    const beforeShape = shape(withoutLock);
    const withLock = page(true, null);
    expect(withLock.querySelector('app-engagement-feature-lock')!.textContent!.trim()).toBe('');
    expect(shape(withLock)).toEqual(beforeShape);
  });

  it('with the served lock (no plan), the lock shows its words and the interview questions step is still all there', () => {
    const beforeShape = shape(page(false, null));
    const context: EngagementContext = JSON.parse(JSON.stringify(ENGAGEMENT_CONTEXT_RESPONSE.context));
    context.capabilities = JSON.parse(JSON.stringify(E2_CAPABILITIES_NO_PLAN_OWNER));
    const shell = page(true, context);
    expect(shell.querySelector('.gh-feature-lock__title')!.textContent!.trim())
      .toBe(E2_CAPABILITIES_NO_PLAN_OWNER.features.video_interview_questions!.nudge!.title);
    expect(shell.querySelector('app-create-interview-questions')).not.toBeNull();
    expect(shape(shell)).toEqual(beforeShape);
  });
});
