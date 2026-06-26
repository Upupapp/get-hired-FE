import { Component, HostListener, OnInit } from '@angular/core';
import { CoreService } from '@app-core/services/core.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  isUserLoggedIn: boolean;
  user = PublicComponent.safeParseUser();

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
    this.isUserLoggedIn = this.coreService.isLoggedIn();
  }
}
