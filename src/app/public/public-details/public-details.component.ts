import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';

@Component({
  selector: 'app-public-details',
  templateUrl: './public-details.component.html',
  styleUrls: ['./public-details.component.scss']
})
export class PublicDetailsComponent implements OnInit {
  details$ = this.jobFacade.getJobById$;
  jobId: string;
  public screenSize: number = 1600;

  constructor(
    private jobFacade: JobFacade,
    private route: ActivatedRoute,
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

}
