import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { 
  Router, 
  ActivatedRoute 
} from '@angular/router';

@Component({
  selector: 'app-explore-users',
  animations: [mainAnimations],
  templateUrl: './explore-users.component.html',
  styleUrls: ['./explore-users.component.scss']
})
export class ExploreUsersComponent implements OnInit {
  @Input() loggedUserData: any = {};
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  // BUGFIX: this button had no click handler at all. AuthGuard already
  // handles the logged-out case (this banner shows to anonymous visitors
  // too) with its own snackbar + redirect to /signin, so no extra check
  // is needed here -- same target used by redirectToUpdate() and others.
  goToUploadResume(): void {
    this.router.navigateByUrl('/user/profile/edit');
  }

  // BUGFIX: same missing handler. Reuses the existing openAiCreate=1
  // integration point already built into EmployerPanelComponent's
  // ngOnInit (added for the post-Business-Setup redirect) instead of
  // duplicating the MatDialog-based AI Create flow in this component.
  goToCreateJob(): void {
    this.router.navigate(['/recruiter/dashboard'], { queryParams: { openAiCreate: 1 } });
  }

}
