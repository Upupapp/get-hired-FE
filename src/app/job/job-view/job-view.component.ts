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
import { mainAnimations } from '@app-shared/animations/main-animations';
import { companyLists, Company } from '@main/views/home/utils/company-list-model-interface';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { JobFacade } from '@app-job/state/job.facade';
import { map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-job-view',
  animations: [mainAnimations],
  templateUrl: './job-view.component.html',
  styleUrls: ['./job-view.component.scss']
})
export class JobViewComponent implements OnInit {

  public loading: boolean = false;
  public screenSize: number = 1600;
  public companyLists: Company[] = companyLists;
  public listView: boolean = false;
  public selectedJobPost: any;
  public selectedCompany: Company;
  public jobId: any;

  editJob$ = this.jobFacade.getJobById$
  .pipe(
    map(job => {
      return (job)
    })
  );
  loading$ = this.jobFacade.getJobLoading$
  .pipe().subscribe(this.onLoad.bind(this));

  constructor(public router: Router,
    public location: Location,
    private jobFacade: JobFacade,
    public route: ActivatedRoute) {
      this.route.queryParams.subscribe(params => {
        this.jobId = params.id
      });
    }

  ngOnInit(): void {
    this.screenSize = window.innerWidth;
    if(this.jobId){
      this.getJobById();
    }

    this.editJob$.subscribe((data: any) => {
      if(data){
        this.selectedJobPost = data;
      }
    })

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  async getJobById() {
    await this.jobFacade.getJobById(this.jobId);
  }

  onLoad(isLoading) {
    this.loading = isLoading;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

  goBack(){
    this.location.back();
  }
}
