import { fakeAsync, flush, flushMicrotasks, tick } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { JobListComponent } from './job-list.component';
import { EasyJobPostAssistantModalComponent } from '../easy-job-post-assistant/easy-job-post-assistant-modal/easy-job-post-assistant-modal.component';
import { SubscriptionAlertComponent } from '@app-shared/components/subscription-alert/subscription-alert.component';

/**
 * B5.1: "Post a job" on the jobs list. Nothing on the client decides the plan limit any more:
 * the list opens the assistant, whose "Post now" reaches POST /job/create, and a 402 there
 * opens the limit dialog (pinned in easy-job-post-assistant-modal.plan-limit.spec.ts).
 */
describe('JobListComponent -- "Post a job" has no client-side plan gate (B5.1)', () => {
  const LIMIT_REACHED = { jobPost: 1, jobPostCount: 1 };

  function create() {
    // closeAll: the list's ngOnDestroy closes any dialog it opened.
    const dialog = { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(undefined) }), closeAll: jasmine.createSpy('closeAll') };
    const restrictionsRead = jasmine.createSpy('subsRestrictions$').and.returnValue(of(LIMIT_REACHED));
    const facade: any = {
      jobList$: of([]), success$: of(null), loading$: of(false), jobError$: of(null),
      getBasicList: jasmine.createSpy('getBasicList'),
      getCompanySubscription: jasmine.createSpy('getCompanySubscription'),
    };
    Object.defineProperty(facade, 'subsRestrictions$', { get: restrictionsRead });
    const component = new JobListComponent(
      jasmine.createSpyObj('Router', ['navigate']), dialog as any,
      { snapshot: { queryParamMap: convertToParamMap({}) } } as any,
      jasmine.createSpyObj('SnackbarService', ['success', 'error']), facade, {} as any,
      { instant: (key: string) => key } as any,
    );
    return { component, dialog, facade, restrictionsRead };
  }

  it('opens the job post assistant even where the old check saw the job limit reached, never the subscription alert', () => {
    const { component, dialog } = create();
    component.openJobPostAssistant();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open.calls.mostRecent().args[0]).toBe(EasyJobPostAssistantModalComponent);
    expect(dialog.open.calls.allArgs().filter((args: any[]) => args[0] === SubscriptionAlertComponent)).toEqual([]);
  });

  it('neither requests nor reads subscription restrictions when the list loads', fakeAsync(() => {
    const saved = localStorage.getItem('user');
    localStorage.setItem('user', JSON.stringify({ companyId: 'CO-1' }));
    try {
      const { component, facade, restrictionsRead } = create();
      component.ngOnInit();
      flushMicrotasks();
      tick(1500);
      flush();   // ngOnInit queues further timers of its own; drain them so none outlive the spec
      expect(facade.getBasicList).withContext('the list did load').toHaveBeenCalledWith('CO-1');
      expect(facade.getCompanySubscription).not.toHaveBeenCalled();
      expect(restrictionsRead).not.toHaveBeenCalled();
      component.ngOnDestroy();
    } finally {
      if (saved === null) { localStorage.removeItem('user'); } else { localStorage.setItem('user', saved); }
    }
  }));
});
