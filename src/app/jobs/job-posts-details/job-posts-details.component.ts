import { Component, HostListener, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { Location } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-job-posts-details',
  templateUrl: './job-posts-details.component.html',
  styleUrls: ['./job-posts-details.component.scss'],
  animations: [mainAnimations]
})
export class JobPostsDetailsComponent implements OnInit {
  @Input() withBanner: boolean = true;
  details$ = this.jobFacade.getJobById$;
  jobId: string;

  
  public screenSize: number = 1600;

  constructor(
    private jobFacade: JobFacade,
    private route: ActivatedRoute,
    public location: Location
  ) {
    this.jobId = this.route.snapshot.params['id']
  }

  ngOnInit(): void {
    this.jobFacade.getJobById(this.jobId)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }


  goBack(){
    this.location.back();
  }

}
