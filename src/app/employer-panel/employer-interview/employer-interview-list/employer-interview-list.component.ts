import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-employer-interview-list',
  templateUrl: './employer-interview-list.component.html',
  styleUrls: ['./employer-interview-list.component.scss'],
  animations: [mainAnimations],
})
export class EmployerInterviewListComponent implements OnInit {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
  }

  addInterviews(){
    console.log('Hala siya')
    this.router.navigate(['../create'], { relativeTo: this.route, queryParams: { step: 1 } })
  }

}
