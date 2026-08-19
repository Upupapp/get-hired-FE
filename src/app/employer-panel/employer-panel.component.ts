import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EasyJobPostAssistantModalComponent } from '@app-job/easy-job-post-assistant/easy-job-post-assistant-modal/easy-job-post-assistant-modal.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CompanyNotSetupComponent } from '@main/company/company-not-setup/company-not-setup.component';
import { CompanyFacade } from '@main/company/state/company.facade';
import { CoreService } from '@main/core/services/core.service';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { Observable, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { PublicJobPreviewService } from '@main/public/services/public-job-preview.service';

@Component({
  selector: 'app-employer-panel',
  templateUrl: './employer-panel.component.html',
  styleUrls: ['./employer-panel.component.scss'],
  animations: [mainAnimations]
})
export class EmployerPanelComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean;
  user = JSON.parse(localStorage.getItem('user'));
  employee$ = this.employeeFacade.employeeDetails$;
  loading$ = this.employeeFacade.loading$;

  // B02: Mobile drawer state
  mobileNavOpen = false;

  avatarMenuOpen = false;
  companyNameForTopbar$: Observable<string>;
  companyLogoUrl$: Observable<string>;

  @ViewChild('mobileMenuBtn') mobileMenuBtnRef: ElementRef<HTMLButtonElement>;
  @ViewChild('firstDrawerLink') firstDrawerLinkRef: ElementRef<HTMLAnchorElement>;

  private routerSub: Subscription;

  constructor(
    private coreService: CoreService,
    private employeeFacade: EmployeeFacade,
    private companyFacade: CompanyFacade,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private jobPreviewService: PublicJobPreviewService,
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.employeeFacade.getEmployeeProfile(this.user._id);
    this.checkAndClaimAiPreview();

    // companyName for topbar avatar menu — reads from companyFacade.companyDetails$
    // (the authoritative store slice) so it updates immediately when the recruiter
    // saves company settings, without waiting for a getEmployeeProfile() re-fetch.
    this.companyNameForTopbar$ = this.companyFacade.companyDetails$.pipe(
      map(company => (company && company.companyName) ? company.companyName : '')
    );
    this.companyLogoUrl$ = this.companyFacade.companyDetails$.pipe(
      map(company => (company && company.companyLogoUrl) ? company.companyLogoUrl : '')
    );

    // B02: Close mobile drawer on every successful navigation
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.closeMobileNav());
  }

  // B02: Open mobile nav drawer
  openMobileNav(): void {
    this.mobileNavOpen = true;
    // Move focus into drawer after CSS transition completes
    setTimeout(() => {
      if (this.firstDrawerLinkRef?.nativeElement) {
        this.firstDrawerLinkRef.nativeElement.focus();
      }
    }, 200);
  }

  // B02: Close mobile nav drawer and return focus to menu button
  closeMobileNav(): void {
    if (!this.mobileNavOpen) return;
    this.mobileNavOpen = false;
    // Return focus to hamburger button after drawer closes
    setTimeout(() => {
      if (this.mobileMenuBtnRef?.nativeElement) {
        this.mobileMenuBtnRef.nativeElement.focus();
      }
    }, 50);
  }

  // B02: Global Escape handler — closes drawer from anywhere on the page
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
    if (this.avatarMenuOpen) {
      this.closeAvatarMenu();
    }
  }

  // Close avatar menu on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.avatarMenuOpen && target && !target.closest('.gh-topbar-avatar-wrap')) {
      this.closeAvatarMenu();
    }
  }

  // Guards against a duplicate claim within the same page life (e.g. a
  // component re-init quirk re-running ngOnInit before the first claim
  // request resolves). A full page reload always aborts any in-flight
  // request, so this only needs to cover same-tab, same-load duplication --
  // true cross-request exactly-once still requires a backend-side atomic
  // claim (see GETHIRED_EMPLOYER_START_HIRING_MASTER_COMMAND note in
  // get-hired-BE/notes.md).
  private aiPreviewClaimInFlight = false;

  // ─── AI Preview Claim — runs once on employer panel init ────────────────
  // If the user arrived here via the public AI preview flow (signed up / signed
  // in after generating a preview), claim the draft and navigate to job list.
  private checkAndClaimAiPreview(): void {
    const token = this.jobPreviewService.getPendingToken();
    if (!token || this.aiPreviewClaimInFlight) return;
    this.aiPreviewClaimInFlight = true;

    this.jobPreviewService.claimPreview(token)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.aiPreviewClaimInFlight = false;
          this.jobPreviewService.clearPendingToken();
          if (res && res.jobId) {
            this.router.navigate(['/recruiter/jobs/list'], {
              queryParams: { claimedDraft: '1' },
            });
          }
        },
        error: () => {
          // Non-fatal — token may have expired; clear it silently and continue
          this.aiPreviewClaimInFlight = false;
          this.jobPreviewService.clearPendingToken();
        },
      });
  }

  /** Called from the "sign in again" button on the profile-load-error fallback.
   *  Clears the session and navigates to /signin so the guard doesn't re-admit. */
  signInAgain(): void {
    this.coreService.logout();
    this.router.navigate(['/signin']);
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  get pageTitle(): string {
    const url = this.router.url;
    if (url.includes('/jobs/list'))           return 'Job Posts';
    if (url.includes('/jobs/expired'))        return 'Expired Jobs';
    if (url.includes('/jobs/create'))         return 'Post a Job';
    if (url.includes('/jobs/edit'))           return 'Edit Job';
    if (url.includes('/jobs/applicants'))     return 'Applicants';
    if (url.includes('/jobs/view'))           return 'Job Preview';
    if (url.includes('/jobs/dashboard'))      return 'Job Overview';
    if (url.includes('/jobs'))                return 'Jobs';
    if (url.includes('/contacts/list'))       return 'Contact List';
    if (url.includes('/contacts/candidates')) return 'Applicants';
    if (url.includes('/contacts/candidate-list')) return 'Candidate Profile';
    if (url.includes('/contacts/groups'))     return 'Contact Groups';
    if (url.includes('/contacts/group-list')) return 'Contact Group';
    if (url.includes('/contacts'))            return 'Candidates';
    if (url.includes('/interview'))           return 'Interviews';
    if (url.includes('/messages'))            return 'Messages';
    if (url.includes('/company'))             return 'Company';
    if (url.includes('/subscription'))        return 'Subscription';
    if (url.includes('/dashboard'))           return 'Dashboard';
    return 'Dashboard';
  }

  get parentLabel(): string {
    const url = this.router.url;
    if (url.includes('/jobs/list') || url.includes('/jobs/expired') ||
        url.includes('/jobs/create') || url.includes('/jobs/edit') ||
        url.includes('/jobs/applicants') || url.includes('/jobs/view') ||
        url.includes('/jobs/dashboard'))      return 'Jobs';
    if (url.includes('/contacts/list') || url.includes('/contacts/candidates') ||
        url.includes('/contacts/candidate-list') || url.includes('/contacts/groups') ||
        url.includes('/contacts/group-list')) return 'Candidates';
    if (url.includes('/interview') || url.includes('/messages')) return 'Hiring Workspace';
    if (url.includes('/company'))             return 'Company';
    if (url.includes('/subscription'))        return 'Account';
    return '';
  }

  get pageSubtitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard'))               return 'Track job activity, applicants, and hiring health.';
    if (url.includes('/jobs/list'))               return 'Manage published, draft, and expired job posts.';
    if (url.includes('/jobs/expired'))            return 'Review closed or expired jobs for reference or reuse.';
    if (url.includes('/jobs/create'))             return 'Build and publish your job post step by step.';
    if (url.includes('/jobs/edit'))               return 'Update this job post and republish changes.';
    if (url.includes('/jobs/applicants'))         return 'Review candidates who applied to this job.';
    if (url.includes('/contacts/list'))           return 'Manage candidate contacts and outreach records.';
    if (url.includes('/contacts/candidates'))     return 'Review all candidates who applied to your jobs.';
    if (url.includes('/contacts/candidate-list')) return 'Review this candidate\'s application and profile.';
    if (url.includes('/contacts/groups'))         return 'Organise contacts into groups for hiring campaigns.';
    if (url.includes('/interview'))               return 'Review interview activity and candidate video responses.';
    if (url.includes('/messages'))                return 'Manage candidate conversations across your jobs.';
    if (url.includes('/company'))                 return 'Manage your employer brand and public company profile.';
    if (url.includes('/subscription'))            return 'Manage your GetHired plan and billing settings.';
    return '';
  }

  toggleAvatarMenu(): void {
    this.avatarMenuOpen = !this.avatarMenuOpen;
  }

  closeAvatarMenu(): void {
    this.avatarMenuOpen = false;
  }

  goToCreateJob(): void {
    this.dialog.open(EasyJobPostAssistantModalComponent, {
      width: '560px',
      maxWidth: '96vw',
      panelClass: 'gh-assistant-dialog',
    });
  }

  goToJobsList(): void {
    this.router.navigate(['/recruiter/contacts/candidates']);
  }

  logout(): void {
    this.coreService.logout();
    this.router.navigate(['/signin']);
  }
}
