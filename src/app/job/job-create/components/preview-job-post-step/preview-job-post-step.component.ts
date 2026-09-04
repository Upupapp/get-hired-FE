import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { combineLatest, Subscription } from 'rxjs';
import * as Model from '../../../job.model';
import { PublicJobNormalizerService } from '@main/public/services/public-job-normalizer.service';
import { JobMatchabilityService, JobMatchabilityResult } from '@main/public/services/job-matchability.service';
// B13: Job Readiness
import { JobReadinessService, JobReadinessResult } from '../../../services/job-readiness.service';
import { FREELANCE_JOB_TYPE_SENTINEL } from '@app-job/utils/job-field-resolvers';

@Component({
  selector: 'app-preview-job-post-step',
  animations: [mainAnimations],
  templateUrl: './preview-job-post-step.component.html',
  styleUrls: ['./preview-job-post-step.component.scss']
})
export class PreviewJobPostStepComponent implements OnInit, OnDestroy {
  @Input() jobPostData: any = {};
  /** Simplified job-post mode: Step 3 (Screening & Interview) is hidden
   *  entirely from the stepper/canvas in this mode, so the Interview
   *  Questions preview section here must not offer any goToStep(3) link --
   *  it's replaced with a plain informational note instead. */
  @Input() simplified: boolean = false;
  /** True only for jobs reached via the AI Assistant's "Review & edit
   *  first". Shows "No Data Provided" for the 3 fields that flow actually
   *  requires (job title, work setup, compensation) when still empty --
   *  the Employer must be able to reach and view this step regardless of
   *  what's filled in, per that flow's own smaller required set (see
   *  job-create.component.ts's setFormGroup()/publishJobPost()). Every
   *  other mode keeps its current behavior (pill/line simply doesn't
   *  render when empty) completely unchanged. */
  @Input() assistantPrefilled: boolean = false;
  @Output() navigateToStep = new EventEmitter<number>();
  subscriptions = new Subscription();

  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  preview: Model.Job;
  industries: Model.Options[] = [];
  roles: Model.Options[] = [];
  types: Model.Options[] = [];
  setups: Model.Options[] = [];
  levels: Model.Options[] = [];
  loading: boolean = true;

  /** MATCH v3 -- Job Post Matchability (Layer 1). Computed from the same
   * draft data already assembled for the preview below; never blocks
   * publishing, purely informational. */
  matchability: JobMatchabilityResult | null = null;

  /** Severity tier derived from matchability.label, purely for styling the
   *  redesigned score meter (ring color / accent) -- mirrors the thresholds
   *  already used by JobMatchabilityService.labelFor(), no new scoring logic. */
  get matchabilitySeverity(): 'low' | 'medium' | 'high' {
    if (!this.matchability) return 'low';
    if (this.matchability.label === 'Highly Matchable' || this.matchability.label === 'Matchable') return 'high';
    if (this.matchability.label === 'Limited Matching Clarity') return 'medium';
    return 'low';
  }

  /** SVG ring geometry for the score meter (circumference of r=26 circle). */
  readonly matchabilityRingCircumference = 163.36;

  /** B13: Job Readiness summary — shown in the preview step only */
  previewReadiness: JobReadinessResult | null = null;

  info$ = this.jobFacade.info$;
  initial$ = this.jobFacade.initial$;
  interview$ = this.jobFacade.interview$;
  user$ = this.asyncLocalStorage.getItem('user');

  preview$ = combineLatest([this.info$, this.initial$, this.interview$, this.user$]).subscribe(
    ([info, initial, interview, user]) => {
      this.preview = {
        ...info,
        ...initial,
        isInterviewRequired: false,
        interviewQuestions: interview,
        companyId: JSON.parse(user).companyId,
      }

      this.matchability = this.matchabilityService.evaluate(this.normalizer.normalize(this.preview));

      // B13: Also compute readiness for the preview summary card.
      // companyId comes from the preview object (set from local storage above).
      this.previewReadiness = this.readinessService.evaluate({
        jobTitle:       this.preview.jobTitle,
        jobTypeId:      this.preview.jobTypeId,
        jobLevelId:     this.preview.jobLevelId,
        jobCity:        this.preview.jobCity,
        jobCountry:     this.preview.jobCountry,
        jobDescription: this.preview.jobDescription,
        jobDuties:      this.preview.jobDuties,
        workSetupId:    this.preview.workSetupId,
        jobBanner:      this.preview.jobBanner,
        bannerFile:     (this.preview as any).bannerFile,
        companyId:      this.preview.companyId,
        skills:         this.preview.skills,
        requirements:   this.preview.requirements,
        companyLogoUrl: this.preview.companyLogoUrl,
        companyDetails: this.preview.companyDetails,
        interviewQuestions: this.preview.interviewQuestions,
        educationalBackground: this.preview.educationalBackground,
      });

    });

  goToStep(step: number): void {
    // Defense in depth: Step 3 doesn't exist in Simplified mode (no stepper
    // tab, no visible section for it) -- even though the template below no
    // longer renders any control that calls goToStep(3) in that mode, never
    // let this method itself emit a navigation into the hidden step.
    if (step === 3 && this.simplified) { return; }
    this.navigateToStep.emit(step);
  }

  constructor(
    private jobFacade: JobFacade,
    private normalizer: PublicJobNormalizerService,
    private matchabilityService: JobMatchabilityService,
    private readinessService: JobReadinessService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    // FIX: preview$ is a field-level combineLatest subscription; add it to
    // the subscriptions bag so it is cleaned up in ngOnDestroy.
    this.subscriptions.add(this.preview$);

    this.subscriptions.add(
      this.jobFacade.loading$
        .pipe().subscribe(loading => this.loading = loading)
    );

    this.subscriptions.add(
      this.jobFacade.industry$
        .pipe().subscribe(this.assignToArray.bind(this, 'industries')));

    this.subscriptions.add(
      this.jobFacade.jobRole$
        .pipe().subscribe(this.assignToArray.bind(this, 'roles')));

    this.subscriptions.add(
      this.jobFacade.setup$
        .pipe().subscribe(this.assignToArray.bind(this, 'setups')));

    this.subscriptions.add(
      this.jobFacade.typeList$
        .pipe().subscribe(this.assignToArray.bind(this, 'types')));

    this.subscriptions.add(
      this.jobFacade.level$
        .pipe().subscribe(this.assignToArray.bind(this, 'levels')));
  }

  assignToArray(arrayName: string, options) {
    switch (arrayName) {
      case 'industries':
        this.industries = options;
        break;
      case 'roles':
        this.roles = options;
        break;
      case 'setups':
        this.setups = options;
        break;
      case 'types':
        this.types = options;
        break;
      case 'levels':
        this.levels = options;
        break;
    }
  }

  /** The banner src to display.
   *  Priority: live form data from parent (jobPostData) → NgRx store (preview).
   *  jobPostData is the current initialData form value passed by job-create.component,
   *  ensuring a newly uploaded banner is always visible even before the first API save.
   */
  get previewBannerSrc(): string | null {
    const d = this.jobPostData as any;
    // Check live form value first (covers newly uploaded banners not yet in NgRx store)
    if (d) {
      if (d.bannerFile && Array.isArray(d.bannerFile) && d.bannerFile.length && d.bannerFile[0] && d.bannerFile[0].file) {
        return d.bannerFile[0].file;
      }
      if (d.jobBanner) {
        return d.jobBanner;
      }
    }
    // Fall back to NgRx store data (populated for existing jobs loaded via API)
    const p = this.preview as any;
    if (p && p.bannerFile && Array.isArray(p.bannerFile) && p.bannerFile.length && p.bannerFile[0] && p.bannerFile[0].file) {
      return p.bannerFile[0].file;
    }
    return (p && p.jobBanner) || null;
  }

  /** True when any banner image is available (uploaded file or stored URL). */
  get hasBannerSrc(): boolean {
    return !!this.previewBannerSrc;
  }

  getFilteredArray(arrayName, id: number | string) {
    // FREELANCE_JOB_TYPE_SENTINEL never appears in the live `types` list
    // (no backend job_type row for it) -- it wouldn't be found by the
    // filter below and would throw. Resolve it directly instead.
    if (arrayName === 'types' && id === FREELANCE_JOB_TYPE_SENTINEL) {
      return 'Freelance';
    }

    let chosenArray = [];

    switch(arrayName) {
      case 'industries':
        chosenArray = this.industries;
        break;
      case 'roles':
        chosenArray = this.roles;
        break;
      case 'setups':
        chosenArray = this.setups;
        break;
      case 'types':
        chosenArray = this.types;
        break;
      case 'levels':
        chosenArray = this.levels;
        break;
    }

    // BUGFIX: this used to assume `id` is always present in `chosenArray` and
    // read filteredArray[0].name unguarded. The option lists (industries/
    // roles/setups/types/levels) load asynchronously via their own
    // jobFacade.*$ subscriptions in ngOnInit, while `preview` (built from the
    // NgRx store snapshot) can already have industryId/jobRoleId/etc. set the
    // moment Step 4 first renders -- so on the first change-detection pass,
    // before those lists resolve, chosenArray is still [] and filteredArray[0]
    // is undefined, throwing "Cannot read properties of undefined (reading
    // 'name')" and breaking the whole Preview & Publish step render. Return
    // an empty string until the matching option actually loads instead of
    // crashing; the template already updates once the *$ subscription fires.
    const filteredArray = chosenArray.filter(option => option.id == id);
    return filteredArray[0] ? filteredArray[0].name : '';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
