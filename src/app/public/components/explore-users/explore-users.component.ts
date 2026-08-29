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

  // BUGFIX: this was a stub with empty switch cases -- the buttons did
  // nothing. AuthGuard (on both /recruiter/** and /user/**) already
  // redirects a logged-out visitor to /signin with its own snackbar, so
  // no extra logged-in check is needed here.
  redirectToCreate(item: string) {
    switch (item) {
      case 'job':
        // Same openAiCreate=1 integration point EmployerPanelComponent's
        // ngOnInit already watches for, opening the AI Create job-post
        // assistant -- reused instead of duplicating that MatDialog flow.
        this.router.navigate(['/recruiter/dashboard'], { queryParams: { openAiCreate: 1 } });
        break;
      case 'resume':
        this.router.navigateByUrl('/user/profile/edit');
        break;
    }
  }

}
