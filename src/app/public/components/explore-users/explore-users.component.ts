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
    private routes: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  redirectToCreate(item: string) {
    // TODO check if loggedIn
    switch (item) {
      case 'job':
        // TODO Redirect to Create Jobs
        break;
      case 'resume':
        // TODO Redirect to create Resume
        break;
    }
  }

}
