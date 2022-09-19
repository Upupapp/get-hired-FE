import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-card',
  animations: [mainAnimations],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.scss']
})
export class JobCardComponent implements OnInit {
  @Input() data: any;
  @Input() i: number;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  applyNow(route){
    this.router.navigate(['/']).then(el => this.router.navigate([`/job-post/details/${this.data?.id}`]));
  }

}
