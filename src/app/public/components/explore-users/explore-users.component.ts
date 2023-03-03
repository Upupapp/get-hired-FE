import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import {
  Router,
  ActivatedRoute
} from '@angular/router';

@Component({
  selector: 'app-public-explore-users',
  animations: [mainAnimations],
  templateUrl: './explore-users.component.html',
  styleUrls: ['./explore-users.component.scss']
})
export class ExploreUsersComponent implements OnInit {
  @Input() userRole: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  redirectToCreate(item: string) {
    switch (item) {
      case 'job':
        this.router.navigate(['../signup'], { relativeTo: this.route });
        break;
      case 'resume':
        this.router.navigate(['../user/profile/edit'], { relativeTo: this.route });
        break;
    }
  }

}
