import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LinkedInAuthService } from '../services/linkedin-auth.service';

@Component({
  selector: 'app-linkedin-complete',
  templateUrl: './linkedin-complete.component.html',
  styleUrls: ['./linkedin-complete.component.scss']
})
export class LinkedInCompleteComponent implements OnInit {
  loading = true;
  errorCode: string | null = null;
  errorMessage: string | null = null;

  private readonly ERROR_MESSAGES: Record<string, string> = {
    not_enabled:      'LinkedIn sign-in is not currently available.',
    linkedin_denied:  'You cancelled the LinkedIn sign-in.',
    missing_params:   'The sign-in link is incomplete. Please try again.',
    invalid_state:    'The sign-in request expired or is invalid. Please try again.',
    no_access_token:  'LinkedIn did not return an access token. Please try again.',
    invalid_issuer:   'LinkedIn token validation failed.',
    invalid_audience: 'LinkedIn token validation failed.',
    token_expired:    'The LinkedIn sign-in timed out. Please try again.',
    invalid_nonce:    'LinkedIn token replay detected. Please try again.',
    missing_sub:      'LinkedIn did not return a user ID.',
    missing_email:    'Your LinkedIn account must have a verified email address.',
    email_not_verified: 'Please verify your LinkedIn email address first.',
    server_error:     'Something went wrong on our end. Please try again.',
    missing_ticket:   'The sign-in link is missing a ticket. Please try again.',
    invalid_ticket:   'The sign-in link is expired or already used. Please try again.',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private linkedIn: LinkedInAuthService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const error = params.get('error');

    if (error) {
      this.loading = false;
      this.errorCode = error;
      this.errorMessage = this.ERROR_MESSAGES[error] || 'LinkedIn sign-in failed. Please try again.';
      return;
    }

    const ticket = params.get('ticket');
    if (!ticket) {
      this.loading = false;
      this.errorCode = 'missing_ticket';
      this.errorMessage = this.ERROR_MESSAGES['missing_ticket'];
      return;
    }

    this.linkedIn.setLoading(true);
    this.linkedIn.exchangeTicket(ticket).subscribe({
      next: (response) => {
        this.linkedIn.setLoading(false);
        const outcome = this.linkedIn.handleCompleteResponse(response);
        if (outcome === 'role_required') {
          this.loading = false;
          this.router.navigate(['/choose-role']);
        } else if (outcome === 'error') {
          this.loading = false;
          this.errorCode = 'server_error';
          this.errorMessage = response.message || this.ERROR_MESSAGES['server_error'];
        }
        // 'authenticated' outcome: handleCompleteResponse already navigated
      },
      error: (err) => {
        this.linkedIn.setLoading(false);
        this.loading = false;
        const msg = err && err.error && err.error.message ? err.error.message : null;
        this.errorCode = 'server_error';
        this.errorMessage = msg || this.ERROR_MESSAGES['server_error'];
      }
    });
  }

  retry(): void {
    this.router.navigate(['/signin']);
  }
}
