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
  user = PublicComponent.safeParseUser();
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

  /** Defensive against corrupted/non-JSON localStorage['user'] -- a
   * field initializer throwing here would have blocked this component
   * (and everything nested under its <router-outlet>) from ever
   * constructing, with no clear top-level error.
   * MV3-F3: also guards against SSR (server-side rendering) where
   * localStorage is not defined at all. The try/catch prevented a hard
   * crash but still logged a ReferenceError on every SSR render because
   * `localStorage` is an unresolvable identifier on the server, not an
   * exception thrown by the API. The `typeof` check avoids the throw
   * entirely and keeps the server log clean. */
  private static safeParseUser(): any {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  constructor(
    private coreService: CoreService
  ) {}
  ngOnInit(): void {
    this.authStateSubscription = this.coreService.authState$.subscribe((loggedIn) => {
      this.isUserLoggedIn = loggedIn;
      this.user = PublicComponent.safeParseUser();
    });
  }

  ngOnDestroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }
}
