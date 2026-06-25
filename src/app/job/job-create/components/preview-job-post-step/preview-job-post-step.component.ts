import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { combineLatest, Subscription } from 'rxjs';
import * as Model from '../../../job.model';
import { PublicJobNormalizerService } from '@main/public/services/public-job-normalizer.service';
import { JobMatchabilityService, JobMatchabilityResult } from '@main/public/services/job-matchability.service';
// B13: Job Readiness
import { JobReadinessService, JobReadinessResult } from '../../../services/job-readiness.service';

@Component({
  selector: 'app-preview-job-post-step',
  animations: [mainAnimations],
  templateUrl: './preview-job-post-step.component.html',
  styleUrls: ['./preview-job-post-step.component.scss']
})
export class PreviewJobPostStepComponent implements OnInit, OnDestroy {
  @Input() jobPostData: any = {};
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

  public dragPosition = JSON.parse(sessionStorage.getItem('job-post-banner-position')) || {
    x: 0.25, y: -160
  }


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
        bannerPosition: this.dragPosition
      }

      console.log('PREVIEW: ');
      console.log(this.preview)

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

  constructor(
    private jobFacade: JobFacade,
    private normalizer: PublicJobNormalizerService,
    private matchabilityService: JobMatchabilityService,
    // B13: Job Readiness
    private readinessService: JobReadinessService,
  ) { }

  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });


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

  getFilteredArray(arrayName, id: number) {
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

    const filteredArray = chosenArray.filter(option => option.id == id);
    const name = filteredArray[0].name;
    return name;

  }

  // Update Drag position
  onDragEnded(event) {
    let element = event.source.getRootElement();
    let imageSourceFile = document.getElementById('banner-source-file');
    let boundingClientRect = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);
    let dragPosition = { x: 0, y: /*((imageSourceFile?.offsetHeight)/2) +*/ ((boundingClientRect.y) - (parentPosition.top)) };

    // temporary save to local storage
    sessionStorage.setItem('job-post-banner-position', JSON.stringify(dragPosition))
    console.log(dragPosition, imageSourceFile?.scrollHeight)
    //console.log('x: ' + (boundingClientRect.x - parentPosition.left), 'y: ' + (boundingClientRect.y - parentPosition.top));
  }

  getPosition(el) {
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
