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
   * constructing, with no clear top-level error. */
  private static safeParseUser(): any {
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
