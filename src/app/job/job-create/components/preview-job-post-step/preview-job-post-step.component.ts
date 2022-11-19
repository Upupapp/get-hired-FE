import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { combineLatest } from 'rxjs';
import * as Model from '../../../job.model';

@Component({
  selector: 'app-preview-job-post-step',
  animations: [mainAnimations],
  templateUrl: './preview-job-post-step.component.html',
  styleUrls: ['./preview-job-post-step.component.scss']
})
export class PreviewJobPostStepComponent implements OnInit {
  @Input() jobPostData: any = {};

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

  info$ = this.jobFacade.info$;
  initial$ = this.jobFacade.initial$;
  interview$ = this.jobFacade.interview$;
  user$ = this.asyncLocalStorage.getItem('user');

  preview$ = combineLatest([this.info$, this.initial$, this.interview$, this.user$]).subscribe(
    ([info, initial, interview, user]) => {
      this.preview = {
        ...info,
        ...initial,
        ...interview,
        companyId: JSON.parse(user).companyId
      }
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

    console.log(this.preview)
  }

}
