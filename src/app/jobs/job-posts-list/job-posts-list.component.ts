import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { TranslateService } from '@ngx-translate/core';
import { JobsFacade } from '../state/jobs.facade';

@Component({
  selector: 'app-job-posts-list',
  animations: [mainAnimations],
  templateUrl: './job-posts-list.component.html',
  styleUrls: ['./job-posts-list.component.scss']
})
export class JobPostsListComponent implements OnInit {
  @Input() fromSearch: boolean = false;
  @Input() label: string;
  @Input() subLabel: string = this.translate.instant('COMPANY_DETAILS.JOBS_CAREERS_MESSAGE');
  @Input() companyId?: string;
  @Input() searchData?: any;

  public loading: boolean = true;
  public screenSize: number = 1600;
  public listView: boolean = false;

  list$ = this.jobsFacade.jobList$;
  loading$ = this.jobsFacade.loading$;

  constructor(
    private jobsFacade: JobsFacade,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.route.queryParams.subscribe(params => {
      this.companyId = params.id
    });
  }

  ngOnInit(): void {
    this.jobsFacade.getPublishedList(this.companyId);
    this.screenSize = window.innerWidth;
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }
}
