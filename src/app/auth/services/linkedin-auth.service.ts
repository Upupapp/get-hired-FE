import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface LinkedInCompleteResponse {
  success: boolean;
  status: 'authenticated' | 'role_required' | 'error';
  data?: any;
  provider?: string;
  googleEmail?: string;
  googleDisplayName?: string;
  googlePhotoUrl?: string;
  inferredFirstName?: string;
  inferredLastName?: string;
  linkedinPendingToken?: string;
  returnTo?: string;
  expiresInMinutes?: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class LinkedInAuthService {
  private apiUrl = environment.api_url;

  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  loading$ = this._loading$.asObservable();
  error$ = this._error$.asObservable();

  // In-memory pending state for role_required flow
  private _pendingToken: string | null = null;
  private _pendingEmail: string | null = null;
  private _pendingDisplayName: string | null = null;
  private _pendingPhotoUrl: string | null = null;
  private _pendingFirstName: string | null = null;
  private _pendingLastName: string | null = null;

  get hasPendingRoleClassification(): boolean {
    return !!this._pendingToken;
  }
  get pendingEmail(): string { return this._pendingEmail || ''; }
  get pendingDisplayName(): string { return this._pendingDisplayName || ''; }
  get pendingPhotoUrl(): string { return this._pendingPhotoUrl || ''; }
  get pendingFirstName(): string { return this._pendingFirstName || ''; }
  get pendingLastName(): string { return this._pendingLastName || ''; }
  get pendingToken(): string | null { return this._pendingToken; }

  clearPendingRoleState(): void {
    this._pendingToken = null;
    this._pendingEmail = null;
    this._pendingDisplayName = null;
    this._pendingPhotoUrl = null;
    this._pendingFirstName = null;
    this._pendingLastName = null;
  }

  constructor(private http: HttpClient, private router: Router) {}

  // Redirect the browser to the BE /start endpoint which then redirects to LinkedIn.
  // intent: 'auto' | 'jobseeker' | 'employer' — lets BE create account with correct role if new user.
  startLinkedInFlow(intent: 'auto' | 'jobseeker' | 'employer' = 'auto', returnTo?: string): void {
    let url = `${this.apiUrl}/auth/linkedin/start?intent=${intent}`;
    if (returnTo) {
      url += '&returnTo=' + encodeURIComponent(returnTo);
    }
    window.location.href = url;
  }

  // Call after LinkedIn redirect returns to /linkedin/complete with ?ticket=...
  exchangeTicket(ticket: string): Observable<LinkedInCompleteResponse> {
    return this.http.post<LinkedInCompleteResponse>(
      `${this.apiUrl}/auth/linkedin/complete`,
      { ticket }
    );
  }

  // Call from role classification page to finalize new-user account.
  submitRoleSelection(selectedRole: 'job_seeker' | 'employer'): Observable<any> {
    if (!this._pendingToken) {
      throw new Error('No pending LinkedIn session. Please sign in with LinkedIn again.');
    }
    return this.http.post<any>(
      `${this.apiUrl}/auth/linkedin/choose-role`,
      { linkedinPendingToken: this._pendingToken, selectedRole }
    );
  }

  // Process the /complete response and navigate or set pending state.
  // Returns 'authenticated' | 'role_required' | 'error'
  handleCompleteResponse(response: LinkedInCompleteResponse): 'authenticated' | 'role_required' | 'error' {
    if (!response || !response.success) {
      this._error$.next(response && response.message ? response.message : 'LinkedIn sign-in failed.');
      return 'error';
    }

    if (response.status === 'role_required') {
      this._pendingToken = response.linkedinPendingToken || null;
      this._pendingEmail = response.googleEmail || null;
      this._pendingDisplayName = response.googleDisplayName || null;
      this._pendingPhotoUrl = response.googlePhotoUrl || null;
      this._pendingFirstName = response.inferredFirstName || null;
      this._pendingLastName = response.inferredLastName || null;
      return 'role_required';
    }

    if (response.status === 'authenticated' && response.data) {
      this.storeSession(response.data, response.returnTo);
      return 'authenticated';
    }

    return 'error';
  }

  storeSession(data: any, returnUrl?: string): void {
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
          firstName: data.firstName, lastName: data.lastName
        }));
        this.router.navigate(['/admin']);
        break;
      case 2:
        localStorage.setItem('user', JSON.stringify({
          _id: data.id, email: data.email,
          companyId: data.companyId, companyName: data.companyName,
          firstName: data.firstName, lastName: data.lastName
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
          firstName: data.firstName, lastName: data.lastName
        }));
        const dest = returnUrl || localStorage.getItem('returnURL') || '/user/dashboard';
        this.router.navigateByUrl(dest);
        break;
    }
  }

  setLoading(v: boolean): void { this._loading$.next(v); }
  setError(msg: string | null): void { this._error$.next(msg); }
  clearError(): void { this._error$.next(null); }

  // Unlink LinkedIn from current account (requires valid Firebase ID token in Authorization header)
  unlinkLinkedIn(token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/auth/linkedin/unlink`, {
      headers: { Authorization: 'Bearer ' + token }
    });
  }

  getLinkStatus(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/linkedin/link-status`, {
      headers: { Authorization: 'Bearer ' + token }
    });
  }
}
