import {
  Component, Input, Output, EventEmitter,
  PLATFORM_ID, Inject, NgZone, OnInit, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@environments/environment';

// Minimum identity scopes only -- see GETHIRED_CUSTOM_GOOGLE_AUTH_BUTTON
// TAB04. Never request Gmail/Drive/Calendar/Contacts/offline access here.
const GOOGLE_OAUTH_SCOPE = 'openid email profile';

@Component({
  selector: 'app-google-signin-button',
  templateUrl: './google-signin-button.component.html',
  styleUrls: ['./google-signin-button.component.scss']
})
export class GoogleSigninButtonComponent implements OnInit, OnDestroy {
  @Input() label: 'continue_with' | 'signup_with' | 'signin_with' = 'continue_with';
  @Input() disabled = false;
  @Input() fullWidth = true;
  // Emits the Google OAuth access token (NOT an ID-token JWT) once the user
  // completes the real, Google-hosted consent popup. GoogleAuthService is
  // responsible for telling the backend which credential type this is.
  @Output() credential = new EventEmitter<string>();
  @Output() errorEvent = new EventEmitter<string>();

  gisReady = false;
  requestInFlight = false;

  private tokenClient: google.accounts.oauth2.TokenClient | null = null;
  private _pollInterval: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  get buttonLabel(): string {
    switch (this.label) {
      case 'signin_with': return 'Sign in with Google';
      case 'signup_with': return 'Sign up with Google';
      default: return 'Continue with Google';
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.waitForGIS();
  }

  private waitForGIS(): void {
    if ((window as any).google && (window as any).google.accounts && (window as any).google.accounts.oauth2) {
      this.initTokenClient();
      return;
    }
    var attempts = 0;
    this._pollInterval = setInterval(() => {
      attempts++;
      var g = (window as any).google;
      if (g && g.accounts && g.accounts.oauth2) {
        clearInterval(this._pollInterval);
        this.initTokenClient();
      } else if (attempts > 40) {
        clearInterval(this._pollInterval);
        // GIS script never loaded (blocked/offline) -- leave gisReady false,
        // click() below reports a clear retryable error rather than hanging.
      }
    }, 100);
  }

  private initTokenClient(): void {
    try {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: environment.googleClientId,
        scope: GOOGLE_OAUTH_SCOPE,
        callback: (response: google.accounts.oauth2.TokenResponse) => {
          this.ngZone.run(() => {
            this.requestInFlight = false;
            if (response && response.access_token) {
              this.credential.emit(response.access_token);
            } else if (response && response.error === 'access_denied') {
              this.errorEvent.emit('google_denied');
            } else {
              this.errorEvent.emit('google_popup_closed');
            }
          });
        },
        error_callback: (error: google.accounts.oauth2.ClientConfigError) => {
          this.ngZone.run(() => {
            this.requestInFlight = false;
            if (error && error.type === 'popup_failed_to_open') {
              this.errorEvent.emit('google_popup_blocked');
            } else if (error && error.type === 'popup_closed') {
              this.errorEvent.emit('google_popup_closed');
            } else {
              this.errorEvent.emit('google_auth_error');
            }
          });
        }
      });
      this.gisReady = true;
    } catch (e) {
      console.error('[GoogleSigninButton] init error:', e);
    }
  }

  click(): void {
    // Guards duplicate popups / double-click races: ignore re-entrant
    // clicks while a request is already in flight or before GIS is ready.
    if (this.disabled || !this.gisReady || this.requestInFlight || !this.tokenClient) return;
    this.requestInFlight = true;
    try {
      this.tokenClient.requestAccessToken({ prompt: '' });
    } catch (e) {
      this.requestInFlight = false;
      this.errorEvent.emit('google_auth_error');
    }
  }

  ngOnDestroy(): void {
    if (this._pollInterval) clearInterval(this._pollInterval);
  }
}
