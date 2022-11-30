import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  applyNow(route){
    this.router.navigate([`./details/${this.data?.jobId}`], { relativeTo: this.route})
  }

  companyRedirect(){
    this.router.navigate([`../companies/details`], { relativeTo: this.route, queryParams: {
      id: this.data?.companyId
    }});
  }

}
