import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CoreService } from '@app-core/services/core.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean;
  user: any = null;
  // AUTH LIFECYCLE SYNC: subscribed instead of read once in ngOnInit --
  // this component is a persistent shell around every public-site route
  // (<router-outlet> nested underneath it), so it does NOT get torn down
  // and recreated on every navigation the way a top-level lazy-loaded
  // panel module does. A one-time read left the header showing the
  // pre-logout Sign In/Account state until a hard refresh forced a fresh
  // ngOnInit. authState$ (CoreService) re-emits on every completed
  // navigation and immediately on logout(), so this stays correct without
  // requiring a reload.
  private authStateSubscription: Subscription;

  // BUGFIX: `user` used to be a ONE-TIME snapshot, re-read only on
  // authState$ emissions (login/logout/navigation) -- so changing your
  // avatar or name elsewhere in the app (applicant or employer settings,
  // neither of which ever touched localStorage['user'] or this
  // component) left the header showing the old photo/name indefinitely
  // until a hard refresh. CoreService.currentUser$ is a real, continuously
  // -reactive stream those save flows now push into (see
  // CoreService.patchCurrentUser()) -- subscribing to it instead means an
  // avatar/name change reaches this header immediately, no navigation or
  // refresh required.
  private userSubscription: Subscription;

  constructor(
    private coreService: CoreService
  ) {}
  ngOnInit(): void {
    this.userSubscription = this.coreService.currentUser$.subscribe((user) => {
      this.user = user;
    });
    this.authStateSubscription = this.coreService.authState$.subscribe((loggedIn) => {
      this.isUserLoggedIn = loggedIn;
      // Re-syncs currentUser$ from localStorage on every auth-state
      // transition (a fresh sign-in/out writes localStorage directly,
      // outside of patchCurrentUser()) -- ongoing profile/avatar edits in
      // between are covered by the subscription above instead.
      this.coreService.refreshCurrentUserFromStorage();
    });
  }

  ngOnDestroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
