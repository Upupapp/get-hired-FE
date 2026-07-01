import { Component, Input } from '@angular/core';
import { LinkedInAuthService } from '../services/linkedin-auth.service';

@Component({
  selector: 'app-linkedin-button',
  templateUrl: './linkedin-button.component.html',
  styleUrls: ['./linkedin-button.component.scss']
})
export class LinkedInButtonComponent {
  @Input() label: 'Sign in with LinkedIn' | 'Sign up with LinkedIn' | 'Continue with LinkedIn' = 'Continue with LinkedIn';
  @Input() intent: 'auto' | 'jobseeker' | 'employer' = 'auto';
  @Input() returnTo: string = '';
  @Input() fullWidth = true;

  constructor(private linkedIn: LinkedInAuthService) {}

  start(): void {
    this.linkedIn.startLinkedInFlow(this.intent, this.returnTo || undefined);
  }
}
