import { Injectable, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '@environments/environment';

export interface GoogleSessionResponse {
  success: boolean;
  status: 'authenticated' | 'role_required';
  data?: any;
  googleDisplayName?: string;
  googleEmail?: string;
  googlePhotoUrl?: string;
  inferredFirstName?: string;
  inferredLastName?: string;
  firebaseIdToken?: string;
  refreshToken?: string;
  expiresInMinutes?: number;
  errorCode?: string;
  message?: string;
}

export interface ChooseRoleResponse {
  success: boolean;
  status: 'authenticated';
  roleId: number;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private apiUrl = environment.api_url;
  private clientId = environment.googleClientId;

  // In-memory state for pending role classification — NOT persisted to storage
  // If page is refreshed during role selection, user must sign in with Google again (acceptable)
  private _pendingFirebaseToken: string | null = null;
  private _pendingDisplayName: string | null = null;
  private _pendingEmail: string | null = null;
  private _pendingPhotoUrl: string | null = null;
  private _pendingFirstName: string | null = null;
  private _pendingLastName: string | null = null;
  private _pendingRefreshToken: string | null = null;

  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  loading$ = this._loading$.asObservable();
  error$ = this._error$.asObservable();

  get hasPendingRoleClassification(): boolean {
    return !!this._pendingFirebaseToken;
  }

  get pendingDisplayName(): string {
    return this._pendingDisplayName || '';
  }

  get pendingEmail(): string {
    return this._pendingEmail || '';
  }

  get pendingPhotoUrl(): string {
    return this._pendingPhotoUrl || '';
  }

  get pendingFirstName(): string {
    return this._pendingFirstName || '';
  }

  get pendingLastName(): string {
    return this._pendingLastName || '';
  }

  clearPendingRoleState(): void {
    this._pendingFirebaseToken = null;
    this._pendingDisplayName = null;
    this._pendingEmail = null;
    this._pendingPhotoUrl = null;
    this._pendingFirstName = null;
    this._pendingLastName = null;
    this._pendingRefreshToken = null;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Initialize GIS (call once per page, typically from OnInit of auth-bearing pages)
  initializeOneTap(
    onCredential: (googleIdToken: string) => void,
    context: 'signin' | 'signup' | 'use' = 'signin'
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!(window as any).google) return;

    try {
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: google.accounts.id.CredentialResponse) => {
          if (response && response.credential) {
            onCredential(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        context
      });
    } catch (e) {
      console.error('[GoogleAuthService] GIS init error:', e);
    }
  }

  // Show One Tap prompt (only if GIS is loaded and user is eligible)
  showOneTapPrompt(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!(window as any).google) return;
    try {
      google.accounts.id.prompt();
    } catch (e) { /* non-fatal */ }
  }

  // Disable auto-select (call after logout to prevent immediate re-sign-in)
  disableAutoSelect(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!(window as any).google) return;
    try {
      google.accounts.id.disableAutoSelect();
    } catch (e) { /* non-fatal */ }
  }

  // Render the official GIS button into a container element
  renderGoogleButton(container: HTMLElement, options?: Partial<google.accounts.id.GsiButtonConfiguration>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!(window as any).google) return;
    try {
      google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: options && options.text ? options.text : 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: (options && options.width) ? options.width : 320,
        ...options
      });
    } catch (e) {
      console.error('[GoogleAuthService] renderGoogleButton error:', e);
    }
  }

  // Trigger a GIS popup sign-in flow
  // Returns a Promise that resolves with the Google credential (Google ID token)
  signInWithGooglePopup(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId)) {
        reject(new Error('Not in browser'));
        return;
      }
      if (!(window as any).google) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }
      // GIS doesn't have a direct popup API separate from renderButton/initialize+prompt
      // We use a one-time callback pattern with initialize
      try {
        google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: google.accounts.id.CredentialResponse) => {
            if (response && response.credential) {
              resolve(response.credential);
            } else {
              reject(new Error('google_popup_closed'));
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap not available — reject so caller falls back to button
            reject(new Error('one_tap_not_available'));
          }
          if (notification.isDismissedMoment()) {
            reject(new Error('google_prompt_dismissed'));
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  // Core method: send a Google credential to BE, get session or role_required.
  //
  // The custom Sign in with Google button (google-signin-button.component.ts)
  // uses the OAuth2 token-client flow and emits an access token, not a GIS
  // ID-token JWT -- so this now sends { credential, credentialType }, an
  // exact allowlisted enum the backend maps to the correct Firebase
  // exchange itself (see GETHIRED_CUSTOM_GOOGLE_AUTH_BUTTON TAB06). The
  // backend still separately accepts the legacy { googleIdToken } shape for
  // any caller that hasn't migrated, so this change is additive, not a
  // breaking rename of the wire contract.
  exchangeGoogleToken(googleCredential: string): Observable<GoogleSessionResponse> {
    return this.http.post<GoogleSessionResponse>(
      `${this.apiUrl}/auth/google/firebase-session`,
      { credential: googleCredential, credentialType: 'google_access_token' }
    );
  }

  // Submit role selection for new Google users
  submitRoleSelection(selectedRole: 'job_seeker' | 'employer'): Observable<ChooseRoleResponse> {
    if (!this._pendingFirebaseToken) {
      throw new Error('No pending Google session. Please sign in with Google again.');
    }
    return this.http.post<ChooseRoleResponse>(
      `${this.apiUrl}/auth/choose-role`,
      {
        firebaseIdToken: this._pendingFirebaseToken,
        selectedRole
      }
    );
  }

  // Process a GoogleSessionResponse and handle the outcome:
  // - If authenticated: store session in localStorage exactly like loginUser does, navigate by role
  // - If role_required: store pending state, navigate to role classification page
  // Returns 'authenticated' | 'role_required' | 'error'
  handleGoogleSessionResponse(
    response: GoogleSessionResponse,
    returnUrl?: string
  ): 'authenticated' | 'role_required' | 'error' {
    if (!response || !response.success) {
      this._error$.next(response && response.message ? response.message : 'Google sign-in failed.');
      return 'error';
    }

    if (response.status === 'role_required') {
      // Store pending state in-memory for role classification page
      this._pendingFirebaseToken = response.firebaseIdToken || null;
      this._pendingDisplayName = response.googleDisplayName || null;
      this._pendingEmail = response.googleEmail || null;
      this._pendingPhotoUrl = response.googlePhotoUrl || null;
      this._pendingFirstName = response.inferredFirstName || null;
      this._pendingLastName = response.inferredLastName || null;
      this._pendingRefreshToken = response.refreshToken || null;
      return 'role_required';
    }

    if (response.status === 'authenticated' && response.data) {
      this.storeSession(response.data, returnUrl);
      return 'authenticated';
    }

    return 'error';
  }

  // Store session + navigate — matches the exact shape used by SigninComponent.loggedIn()
  //
  // PROD FIX: Google Identity Services invokes its credential callback from
  // outside Angular's NgZone (it's a raw third-party <script>, not
  // zone-patched). Without ngZone.run(), router.navigate() below still
  // updates the browser URL via the History API, but Angular's change
  // detection never runs, so the view keeps rendering SigninComponent --
  // exactly the "URL changes but stuck on the sign-in page" symptom.
  // Wrapping here (the single point every post-auth navigation goes
  // through) fixes it regardless of which caller/context invoked us.
  storeSession(data: any, returnUrl?: string): void {
    this.ngZone.run(() => this._storeSession(data, returnUrl));
  }

  private _storeSession(data: any, returnUrl?: string): void {
    localStorage.removeItem('loginError');
    localStorage.setItem('state', 'true');
    localStorage.setItem('role', data.role);
    localStorage.setItem('loginMessage', 'Sign in was successful.');
    localStorage.setItem('token', 'Bearer ' + data.token);
    localStorage.setItem('token_authorization', data.token.replace('Bearer ', ''));
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    switch (data.role) {
      case 1:
        localStorage.setItem('user', JSON.stringify({
          _id: data.id, email: data.email,
          firstName: data.firstName, lastName: data.lastName,
          photoUrl: data.photoUrl
        }));
        this.router.navigate(['/admin']);
        break;
      case 2:
        localStorage.setItem('user', JSON.stringify({
          _id: data.id, email: data.email,
          companyId: data.companyId, companyName: data.companyName,
          firstName: data.firstName, lastName: data.lastName,
          photoUrl: data.photoUrl
        }));
        if (data.withCompany) {
          if (data.withActiveSubscription) {
            localStorage.setItem('withActiveSubscription', data.withActiveSubscription);
            this.router.navigate(['/recruiter/dashboard']);
          } else {
            this.router.navigate(['/recruiter/subscription']);
          }
        } else {
          this.router.navigate(['/recruiter/company']);
        }
        break;
      case 3:
      default:
        localStorage.setItem('user', JSON.stringify({
          _id: data.id, email: data.email,
          firstName: data.firstName, lastName: data.lastName,
          photoUrl: data.photoUrl
        }));
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          const storedReturn = localStorage.getItem('returnURL');
          if (storedReturn) {
            // PROFILE-SETUP PHASE 1 FIX: consumed once, matching
            // signin.component.ts -- was previously read but never cleared.
            localStorage.removeItem('returnURL');
            this.router.navigateByUrl(storedReturn);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        }
        break;
    }
  }

  setLoading(val: boolean): void { this._loading$.next(val); }
  setError(msg: string | null): void { this._error$.next(msg); }
  clearError(): void { this._error$.next(null); }
}
