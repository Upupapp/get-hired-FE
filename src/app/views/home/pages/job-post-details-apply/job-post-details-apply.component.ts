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
import { jobLists, Job } from '../../utils/job-list-model-interface';
import { companyLists, Company } from '../../utils/company-list-model-interface';
import { Router, ActivatedRoute } from '@angular/router';
import { InterviewNotificationComponent } from './steps/interview-questions/components/interview-notification/interview-notification.component';
import {
  Subscription,
  Observable,
  forkJoin,
  combineLatest
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-job-post-details-apply',
  animations: [mainAnimations],
  templateUrl: './job-post-details-apply.component.html',
  styleUrls: ['./job-post-details-apply.component.scss']
})
export class JobPostDetailsApplyComponent implements OnInit {
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();

  public loading: boolean = true;
  public screenSize: number = 1600;
  public jobLists: Job[] = jobLists;
  public companyLists: Company[] = companyLists;
  public listView: boolean = false;
  public selectedJobPost: Job;
  public selectedCompany: Company;
  public stepperItems: any[] = [
    {
      id: 1,
      title: "My Details",
      valid: true
    },

    {
      id: 2,
      title: "Additional Documents",
      valid: true
    },

    {
      id: 3,
      title: "Interview",
      valid: true
    },

    {
      id: 4,
      title: "Summary",
      valid: true
    },
  ];

  public stepper: number = 1;

  constructor(
    private dialog: MatDialog,
    public router: Router,  
    public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.screenSize = window.innerWidth;

    let id = this.route.snapshot.params['id'] * 1;
    this.selectedJobPost = this.jobLists.find(el => el.id === id);
    this.selectedCompany = this.companyLists.find(el => el.id === this.selectedJobPost?.company_id);
    console.log(id, this.selectedJobPost)

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

  changeStep(step: number): void {
    this.stepper = step;

    if(step === 3){
      this.openInterviewNotification()
    }
  }

  openInterviewNotification(data?: any) {
    let dialogModal = this.dialog.open(
      InterviewNotificationComponent,
      {
        width: '37vw',
        data: data,
      }
    );

    dialogModal
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        console.log(result)

        if(result?.skip){
          this.changeStep(4);
        }
      });
  }
}
