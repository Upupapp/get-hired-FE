import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { GroupInterviewSummaryComponent } from '@main/interview/group-interview-summary/group-interview-summary.component';

@Component({
  selector: 'app-create-employer-interview',
  templateUrl: './create-employer-interview.component.html',
  styleUrls: ['./create-employer-interview.component.scss'],
  animations: [mainAnimations]
})
export class CreateEmployerInterviewComponent implements OnInit {
  @ViewChild('groupInterviewSummary') groupInterviewSummary: GroupInterviewSummaryComponent;
  stepper = 1;

  groupInterview: any;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
  }

  getBack() {
    this.router.navigate(['../'], { relativeTo: this.route })
  }

  showSummary(interview) {
    this.stepper = 2
    this.groupInterview = interview;
  }

  publishInterview() {
    this.groupInterviewSummary.publishInterview();
  }

}
