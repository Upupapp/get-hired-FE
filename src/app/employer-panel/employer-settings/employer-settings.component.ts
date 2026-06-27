// GETHIRED_COMPANY_SETTINGS_PUBLIC_PROFILE_FULL_REVAMP_V2_BRAND_OS_NEXTADMIN
// Phase 5 — Employer Brand Center: full redesign of /recruiter/company/settings.
// 4 tabs: Company Profile | Branding & Media | Team & Access | Account Settings.
// Data sync fix: after any successful update, localStorage is refreshed with
// companyName + companyId + companyLogoUrl so sidebar/topbar reflect changes
// without a page reload.

import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyBasicComponent } from '@app-company/company-basic/company-basic.component';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CompanyFacade } from '@app-company/state/company.facade';

@Component({
  selector: 'app-employer-settings',
  templateUrl: './employer-settings.component.html',
  styleUrls: ['./employer-settings.component.scss']
})
export class EmployerSettingsComponent implements OnInit, OnDestroy {
  subscriptions$ = new Subscription();
  private destroy$ = new Subject<void>();

  // ─── Tabs ───────────────────────────────────────────────────────────────────
  // 1 = Company Profile, 2 = Branding & Media, 3 = Team & Access, 4 = Account
  public activeTab: number = 1;

  public tabs: { id: number; label: string; icon: string }[] = [
    { id: 1, label: 'Company Profile', icon: 'building' },
    { id: 2, label: 'Branding & Media', icon: 'image' },
    { id: 3, label: 'Team & Access', icon: 'users' },
    { id: 4, label: 'Account Settings', icon: 'settings' }
  ];

  companyId: string;
  companyName: string = '';
  companyLogoUrl: string = '';
  companySlug: string = '';

  // Profile completeness computed from company data
  profileCompleteness: number = 0;

  constructor(
    private employeeFacade: EmployeeFacade,
    private companyFacade: CompanyFacade,
    private dialog: MatDialog,
    private router: Router,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.loadUserFromStorage();

    // Open a specific tab if ?tab=N is in the URL (e.g. from Team & Access "Edit my profile")
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const tabParam = parseInt(params['tab'], 10);
      if (tabParam >= 1 && tabParam <= this.tabs.length) {
        this.activeTab = tabParam;
      }
    });

    // Subscribe to company details for completeness badge + logo preview
    this.companyFacade.companyDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        if (company && company.companyId) {
          this.companyId = company.companyId as string;
          this.companyName = company.companyName || '';
          this.companyLogoUrl = (company as any).companyLogoUrl || '';
          this.companySlug = (company as any).slug || '';
          this.profileCompleteness = this.computeCompleteness(company);
          this.cd.markForCheck();
        }
      });
  }

  loadUserFromStorage(): void {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        this.companyId = u.companyId || '';
        this.companyName = u.companyName || '';
        this.companyLogoUrl = u.companyLogoUrl || '';
        if (!this.companyId) {
          this.promptCreateCompany();
        }
      }
    } catch (e) {
      // storage unavailable
    }
  }

  changeTab(tabId: number): void {
    this.activeTab = tabId;
  }

  computeCompleteness(company: any): number {
    if (!company) { return 0; }
    const fields = [
      company.companyName,
      company.companyEmail,
      (company as any).companyLogoUrl,
      company.companyDetails,
      company.industryId,
      company.workSetupId,
      company.numberOfEmployee,
      company.companyAddress || company.companyCity
    ];
    const filled = fields.filter(function(f) { return !!f; }).length;
    return Math.round((filled / fields.length) * 100);
  }

  get completenessLabel(): string {
    if (this.profileCompleteness >= 90) { return 'Complete'; }
    if (this.profileCompleteness >= 60) { return 'Good'; }
    if (this.profileCompleteness >= 30) { return 'Getting started'; }
    return 'Incomplete';
  }

  get completenessColor(): string {
    if (this.profileCompleteness >= 90) { return 'success'; }
    if (this.profileCompleteness >= 60) { return 'warning'; }
    return 'error';
  }

  get publicProfileReady(): boolean {
    return this.profileCompleteness >= 60 && !!this.companyName;
  }

  promptCreateCompany(): void {
    const dialogRef = this.dialog.open(CompanyBasicComponent, {
      width: '30vw',
      disableClose: true
    });

    this.subscriptions$.add(
      dialogRef.afterClosed().subscribe((res) => {
        if (res == 1) {
          this.dialogSuccess();
        }
      })
    );
  }

  dialogSuccess(): void {
    const create = this.dialog.open(UpdatedDialogComponent, {
      disableClose: false,
      width: '50vw',
      data: 'Company successfully set up. Your trial period has started. You can now access all features and edit your company profile to showcase your brand.',
    });

    this.subscriptions$.add(
      create.afterClosed().subscribe(
        () => this.router.navigate(['../../dashboard'], { relativeTo: this.route })
      )
    );
  }

  onCompanyUpdated(event: any): void {
    if (event && event.status) {
      // Refresh employee profile so topbar companyName$ updates
      this.employeeFacade.getEmployeeProfile(event.userId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
