import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { combineLatest, Subscription } from 'rxjs';
import * as Model from '../../../job.model';

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

  info$ = this.jobFacade.info$;
  initial$ = this.jobFacade.initial$;
  interview$ = this.jobFacade.interview$;
  user$ = this.asyncLocalStorage.getItem('user');

  preview$ = combineLatest([this.info$, this.initial$, this.interview$, this.user$]).subscribe(
    ([info, initial, interview, user]) => {
      this.preview = {
        ...info,
        ...initial,
        interviewQuestions: interview,
        companyId: JSON.parse(user).companyId,
        bannerPosition: this.dragPosition
      }

      console.log(this.preview)

    });

  constructor(
    private jobFacade: JobFacade
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

  assignToArray(arrayName, options) {
    console.log(arrayName);
    console.log(options);
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

  getFilteredArray(array, id: number) {
    const filteredArray = array.filter(option => option.id == id);
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
