import {
  Component,
  ElementRef,
  Inject,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  OnInit,
  OnDestroy,
  HostListener,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { JobsFacade } from '../state/jobs.facade';

@Component({
  selector: 'app-job-posts-list',
  animations: [mainAnimations],
  templateUrl: './job-posts-list.component.html',
  styleUrls: ['./job-posts-list.component.scss']
})
export class JobPostsListComponent implements OnInit, OnDestroy {
  @Input() fromSearch: boolean = false;
  @Input() label: string;
  @Input() subLabel: string = this.translate.instant('COMPANY_DETAILS.JOBS_CAREERS_MESSAGE');
  @Input() companyId?: string;
  @Input() searchData?: any;
  @Input() selectedJobId: string | null = null;
  @Output() jobSelected = new EventEmitter<any>();

  public loading: boolean = true;
  public screenSize: number = 1600;
  public listView: boolean = false;

  list$ = this.jobsFacade.jobList$;
  loading$ = this.jobsFacade.loading$;

  // OPTIMIZE-V5: store the queryParams subscription so it can be cleaned up
  // in ngOnDestroy. Previously subscribed in the constructor with no
  // reference held, causing a permanent leak for every instance of this
  // component (it appears on multiple public pages).
  private queryParamsSub: Subscription;

  constructor(
    private jobsFacade: JobsFacade,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      this.companyId = params.id;
    });
  }

  ngOnInit(): void {
    this.jobsFacade.getPublishedList(this.companyId);
    // OPTIMIZE-V5: guard window.innerWidth with isPlatformBrowser so SSR
    // does not crash when this component renders on the server. The 1600
    // default is wide enough that no layout branch is wrong server-side.
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
    }
  }

  ngOnDestroy(): void {
    if (this.queryParamsSub) {
      this.queryParamsSub.unsubscribe();
    }
  }

  // GH-ACT-021: previously only `keyword` was ever applied -- the
  // work-setup/job-type select inputs in the hero/search bar were visible
  // and bound, but silently ignored here, so choosing "Remote" or
  // "Full-Time" had no effect on results. Also crashed if `searchData`
  // existed but `keyword` was undefined (`undefined.toLowerCase()`).
  filterJobList(jobLists: any[]) {
    if (!this.searchData || !jobLists) {
      return jobLists;
    }

    const keyword = (this.searchData.keyword ?? '').toLowerCase().trim();
    const workSetup = this.normalizeFilterValue(this.searchData.work_setup, 'Work Setup');
    const jobType = this.normalizeFilterValue(this.searchData.job_type, 'Job Type');

    return jobLists.filter((job: any) => {
      const matchesKeyword = !keyword || JSON.stringify(job).toLowerCase().includes(keyword);
      const matchesWorkSetup = !workSetup || (job.workSetupName ?? '').toLowerCase() === workSetup;
      const matchesJobType = !jobType || (job.jobTypeName ?? '').toLowerCase() === jobType;
      return matchesKeyword && matchesWorkSetup && matchesJobType;
    });
  }

  private normalizeFilterValue(value: string | undefined, placeholder: string): string {
    if (!value || value === placeholder) {
      return '';
    }
    return value.toLowerCase();
  }

  // OPTIMIZE-V5: trackBy to prevent Angular from destroying and recreating
  // every job card DOM node when the list observable emits a new value
  // (e.g. search/filter update or store refresh). Without trackBy, Angular
  // diffs by object identity, so a re-fetch replaces every node even when
  // jobId values are unchanged.
  trackByJobId(_index: number, job: any): string {
    return job?.jobId;
  }

  @HostListener('window:resize', ['$event'])
  onResize(_event: any) {
    // @HostListener only fires in the browser, so no isPlatformBrowser guard needed here.
    this.screenSize = window.innerWidth;
  }
}
