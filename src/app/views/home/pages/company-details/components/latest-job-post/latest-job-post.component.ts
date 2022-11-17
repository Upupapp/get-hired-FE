import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-latest-job-post',
  animations: [mainAnimations],
  templateUrl: './latest-job-post.component.html',
  styleUrls: ['./latest-job-post.component.scss']
})
export class LatestJobPostComponent implements OnInit {
  @Input() data: any;
  @Input() i: number;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  applyNow(route){
    this.router.navigate(['/']).then(el => this.router.navigate([`/job-post/details/${this.data?.id}`]));
  }

}
