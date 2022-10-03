import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-featured-top-jobs-account-details',
  animations: [mainAnimations],
  templateUrl: './featured-top-jobs-account-details.component.html',
  styleUrls: ['./featured-top-jobs-account-details.component.scss']
})
export class FeaturedTopJobsAccountDetailsComponent implements OnInit {

  @Input() data: any;
  @Input() i: number;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  applyNow(route){
    this.router.navigate(['/']).then(el => this.router.navigate([`/job-post/details/${this.data?.id}`]));
  }

}
