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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.waitForGIS();
  }

  private waitForGIS(): void {
    if ((window as any).google) {
      this.mountButton();
      return;
    }
    var attempts = 0;
    this._pollInterval = setInterval(() => {
      attempts++;
      if ((window as any).google) {
        clearInterval(this._pollInterval);
        this.mountButton();
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

      const width = this.fullWidth
        ? Math.min((this.containerRef.nativeElement.parentElement || this.containerRef.nativeElement).offsetWidth || 340, 400)
        : 320;

      google.accounts.id.renderButton(this.containerRef.nativeElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: this.label,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: width > 60 ? width : 340
      });
      this.gisReady = true;
    } catch (e) {
      console.error('[GoogleSigninButton] mount error:', e);
    }
  }

  ngOnDestroy(): void {
    if (this._pollInterval) clearInterval(this._pollInterval);
  }
}
