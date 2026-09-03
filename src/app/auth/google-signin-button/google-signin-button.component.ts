import {
  Component, Input, Output, EventEmitter,
  ElementRef, ViewChild, PLATFORM_ID, Inject, NgZone, AfterViewInit, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-google-signin-button',
  templateUrl: './google-signin-button.component.html',
  styleUrls: ['./google-signin-button.component.scss']
})
export class GoogleSigninButtonComponent implements AfterViewInit, OnDestroy {
  @Input() label: 'continue_with' | 'signup_with' | 'signin_with' = 'continue_with';
  @Input() disabled = false;
  @Input() fullWidth = true;
  // Emits the Google credential (ID token JWT) when user completes sign-in
  @Output() credential = new EventEmitter<string>();
  @Output() errorEvent = new EventEmitter<string>();

  @ViewChild('gisContainer') containerRef!: ElementRef<HTMLDivElement>;

  gisReady = false;
  private _pollInterval: any;
  private _resizeObserver?: ResizeObserver;
  private _lastRenderedWidth = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.waitForGIS();

    // BUGFIX (responsive/mobile clipping): mountButton() previously only
    // ever measured its container once, at initial mount. Rotating a
    // phone, resizing a window, or any later layout change left Google's
    // rendered button at its original, now-stale width -- either too wide
    // for a newly-narrower container (clipping) or unnecessarily narrow
    // for a newly-wider one. Re-measuring and re-rendering on real size
    // changes keeps it correct continuously, not just at the moment it
    // first mounted -- the same pattern already used for the reCAPTCHA
    // widget in signup.component.ts.
    if (this.containerRef?.nativeElement?.parentElement && 'ResizeObserver' in window) {
      this._resizeObserver = new ResizeObserver(() => {
        const el = this.containerRef?.nativeElement?.parentElement;
        if (!el) return;
        const w = el.offsetWidth;
        // Only re-render on a real (>=8px) change -- ResizeObserver fires
        // on sub-pixel layout noise too, and Google's renderButton() does
        // a real DOM replace each call, not worth doing for a 1px jitter.
        if (this.gisReady && Math.abs(w - this._lastRenderedWidth) >= 8) {
          this.mountButton();
        }
      });
      this._resizeObserver.observe(this.containerRef.nativeElement.parentElement);
    }
  }

  private waitForGIS(): void {
    if ((window as any).google) {
      // BUGFIX (desktop wrapping): when Google's gsi/client script is
      // already loaded/cached (e.g. not this component's first mount in
      // the session), this branch fires synchronously from
      // ngAfterViewInit -- before the browser has necessarily completed a
      // layout pass that accounts for sibling flex items (the LinkedIn
      // button next to this one). mountButton() measures its container's
      // real offsetWidth to size Google's button, so an early measurement
      // here could read a stale/incomplete flex-basis:auto width and pass
      // too narrow a value to Google's renderButton(), which then wraps
      // the label onto two lines with no way to re-measure afterward.
      // requestAnimationFrame defers to after the next layout/paint, by
      // which point sibling sizing (including this row's content-based
      // flex split) has settled.
      requestAnimationFrame(() => this.mountButton());
      return;
    }
    var attempts = 0;
    this._pollInterval = setInterval(() => {
      attempts++;
      if ((window as any).google) {
        clearInterval(this._pollInterval);
        requestAnimationFrame(() => this.mountButton());
      } else if (attempts > 40) {
        clearInterval(this._pollInterval);
      }
    }, 100);
  }

  // PROD FIX: Google Identity Services calls this from its own external
  // <script>, outside Angular's NgZone. Without ngZone.run(), everything
  // downstream (the parent's loading flag, the HTTP call, and eventually
  // router.navigate()) runs unpatched -- router.navigate() still updates
  // the URL via the History API, but Angular's change detection never
  // fires, so the view stays on the sign-in page even though the address
  // bar has changed. Re-entering the zone here fixes the whole chain at
  // its source.
  private handleCredential(response: google.accounts.id.CredentialResponse): void {
    this.ngZone.run(() => {
      if (response && response.credential) {
        this.credential.emit(response.credential);
      } else {
        this.errorEvent.emit('google_popup_closed');
      }
    });
  }

  private mountButton(): void {
    if (!this.containerRef || !this.containerRef.nativeElement) return;
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleCredential.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const measuredWidth = (this.containerRef.nativeElement.parentElement || this.containerRef.nativeElement).offsetWidth;
      const width = this.fullWidth
        ? Math.min(measuredWidth || 340, 400)
        : 320;
      const finalWidth = width > 60 ? width : 340;

      google.accounts.id.renderButton(this.containerRef.nativeElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: this.label,
        shape: 'rectangular',
        logo_alignment: 'left',
        // BUGFIX: hl=en on the gsi/client script tag (index.html) does NOT
        // reach this specific rendering call -- confirmed via live network
        // inspection, the internal accounts.google.com/gsi/button request
        // this triggers carries no hl param at all, and the button kept
        // rendering in a geo-detected language (Filipino, for requests
        // from the Philippines) regardless. GsiButtonConfiguration.locale
        // (typings.d.ts) is the per-call option that actually reaches this
        // request; forcing it to 'en' is what produces literal
        // "Sign in with Google" / "Sign up with Google".
        locale: 'en',
        width: finalWidth
      });
      this._lastRenderedWidth = measuredWidth;
      this.gisReady = true;
    } catch (e) {
      console.error('[GoogleSigninButton] mount error:', e);
    }
  }

  ngOnDestroy(): void {
    if (this._pollInterval) clearInterval(this._pollInterval);
    if (this._resizeObserver) this._resizeObserver.disconnect();
  }
}
