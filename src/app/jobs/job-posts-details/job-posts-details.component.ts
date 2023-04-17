import { Component, HostListener, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { Location } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from "@environments/environment";
import { catchError, of, Subscription, tap } from 'rxjs';
import { JobsService } from '../jobs.service';
import { CoreService } from '@app-core/services/core.service';

@Component({
  selector: 'app-job-posts-details',
  templateUrl: './job-posts-details.component.html',
  styleUrls: ['./job-posts-details.component.scss'],
  animations: [mainAnimations]
})
export class JobPostsDetailsComponent implements OnInit {
  @Input() withBanner: boolean = true;
  @Output() apply = new EventEmitter();
  details$ = this.jobFacade.getJobById$;
  link$: Subscription;
  jobId: string;
  userRole: string;
  currentUrl$: Subscription;

  public screenSize: number = 1600;

  constructor(
    private jobFacade: JobFacade,
    private route: ActivatedRoute,
    private router: Router,
    public location: Location,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private jobsService: JobsService,
    private coreService: CoreService
  ) {
    this.jobId = this.route.snapshot.params['id']
  }

  ngOnInit(): void {
    this.jobFacade.getJobById(this.jobId);
    this.coreService.getRole()
      .then(role => this.userRole = role);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

  goBack() {
    this.location.back();
  }

  toApply() {
    this.apply.emit(true);
  }

  toLogin() {
    this.currentUrl$ = this.route.url.subscribe(value => {
      if (value.length > 0) {
        let url = '';
        value.forEach(path => {
          url = url + '/' + path
        });

        localStorage.setItem('returnURL', url);
        this.router.navigateByUrl('signin');
      }
    })

  }

  getShareableLink(jobId: string) {
    this.link$ = this.jobsService.getShareableLink(jobId)
      .pipe(
        tap(res => {
          if (res.data) {
            console.log(res.data);
            this.clipboard.copy(res.data.shortLink)
            this.snackBar.open(`Link copied to your clipboard`, '', {
              duration: 4000,
              panelClass: 'success-snackbar',
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          }
        }),
        catchError(err => of(err))
      ).subscribe();

  }

  ngOnDestroy(): void {
    if (this.link$) {
      this.link$.unsubscribe();
    }

    if (this.currentUrl$) {
      this.currentUrl$.unsubscribe();
    }

  }

}
