import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';

/**
 * Public-only footer (only ever rendered inside public.component.html --
 * never on an authenticated layout, confirmed by usage search). Cross-links
 * to the job-seeker app the same way every other CTA on this app's public
 * pages does, via environment.jobSeekerAppUrl -- never a hardcoded URL.
 */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  readonly jobSeekerAppUrl = environment.jobSeekerAppUrl;

  constructor() { }

  ngOnInit(): void {
  }

}
