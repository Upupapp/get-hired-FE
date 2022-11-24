import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router } from '@angular/router';
import * as Model from '../jobs.model';

@Component({
  selector: 'app-job-card',
  animations: [mainAnimations],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.scss']
})
export class JobCardComponent implements OnInit {
  @Input() data: Model.BasicJob;
  @Input() i: number;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  applyNow(route){
    // TODO apply button
    this.router.navigate(['/']).then(el => this.router.navigate([`/jobs/details/${this.data?.jobId}`]));
  }

}
