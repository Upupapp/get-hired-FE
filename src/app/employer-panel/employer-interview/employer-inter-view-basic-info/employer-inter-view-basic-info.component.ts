import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { GroupInterviewSummaryComponent } from '@main/interview/group-interview-summary/group-interview-summary.component';

@Component({
  selector: 'app-employer-inter-view-basic-info',
  templateUrl: './employer-inter-view-basic-info.component.html',
  styleUrls: ['./employer-inter-view-basic-info.component.scss'],
  animations: [mainAnimations]
})
export class EmployerInterViewBasicInfoComponent implements OnInit {
  @ViewChild('groupInterviewSummary') groupInterviewSummary: GroupInterviewSummaryComponent;

  stepper = '1';
  groupInterview: any;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if(params.step == 2 && !this.groupInterview) {
        this.router.navigate(['.'], { relativeTo: this.route, queryParams: { step: 1 } })
      } else {
        this.stepper = params.step;
      }
    });
  }

  getBack() {
    this.router.navigate(['../'], { relativeTo: this.route })
  }

  goToTemplate() {
    console.log('anyare')
    this.router.navigate(['../question-template'], { relativeTo: this.route })
  }

  showSummary(interview) {
    this.groupInterview = interview;
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { step: 2 } })
  }

  publishInterview() {
    this.groupInterviewSummary.publishInterview();
  }


}
