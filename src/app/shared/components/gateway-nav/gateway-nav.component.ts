import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@environments/environment';

/**
 * Small, consistent "Back" + "Main Page" nav strip, placed at the top of
 * every public entry-point page (landing, signin, signup) in both apps.
 * Not part of the shared app-header (that one's scoped much more broadly,
 * across every public route including /jobs, /job-seekers, etc.) --
 * this is deliberately narrow and explicit, dropped into exactly the four
 * page types that need it.
 *
 * "Back" uses real browser history (works correctly across the app-to-app
 * boundary too, since these are plain <a href> cross-origin navigations,
 * not client-side router transitions) with a safe fallback to the gateway
 * when there's no real previous page in this tab (e.g. a bookmarked or
 * directly-typed URL).
 */
@Component({
  selector: 'app-gateway-nav',
  templateUrl: './gateway-nav.component.html',
  styleUrls: ['./gateway-nav.component.scss'],
})
export class GatewayNavComponent {
  readonly gatewayUrl = environment.gatewayUrl;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  goBack(): void {
    if (!this.isBrowser) { return; }
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = this.gatewayUrl;
    }
  }
}
