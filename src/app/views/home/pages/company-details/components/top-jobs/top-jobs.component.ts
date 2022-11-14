import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-jobs',
  animations: [mainAnimations],
  templateUrl: './top-jobs.component.html',
  styleUrls: ['./top-jobs.component.scss']
})
export class TopJobsComponent implements OnInit {
  @Input() data: any;
  @Input() i: number;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  applyNow(route){
    this.router.navigate(['/']).then(el => this.router.navigate([`/job-post/details/${this.data?.id}`]));
  }

}
