import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CompanyFacade } from '@main/company/state/company.facade';
import { mainAnimations } from '@main/shared/animations/main-animations';

/**
 * GETHIRED_COMPANY_PROFILE_SUBTABS_B09_WORLD_CLASS_TECHY_V1
 *
 * Company Profile workspace with 3 local subtabs:
 *   1  Profile  — all core company identity fields (existing form)
 *   2  Brand    — candidate-facing overview / logo using company_details + company_logo
 *   3  Benefits — work setup (work_setup_id) + backlogged rich-benefits fields
 *
 * Approach: local stepper (same pattern as EmployerSettingsComponent) so we
 * add ZERO new routes and touch ZERO top-level navigation.
 *
 * Security: no company-scoping changes; all data still flows through the
 * existing NgRx store which calls getUserCompany() on the backend.
 */
@Component({
  selector: 'app-employer-company',
  templateUrl: './employer-company.component.html',
  styleUrls: ['./employer-company.component.scss'],
  animations: [mainAnimations]
})
export class EmployerCompanyComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private subs$ = new Subscription();

  /** Active subtab id: 1=Profile, 2=Brand, 3=Benefits */
  activeTab: number = 1;

  subtabs = [
    { id: 1, label: 'Company Profile' },
    { id: 2, label: 'Employer Brand' },
    { id: 3, label: 'Benefits & Culture' },
  ];

  /** Company snapshot read from store for Brand / Benefits read-only display */
  company$ = this.companyFacade.companyDetails$;
  workSetup$ = this.companyFacade.setup$;
  industry$ = this.companyFacade.industry$;

  /** Saving state for Brand/Benefits feedback */
  saving: boolean = false;
  saveSuccess: boolean = false;
  private saveResetTimer: any;

  constructor(private companyFacade: CompanyFacade) {}

  ngOnInit(): void {
    this.companyFacade.getCompany();
    this.companyFacade.getSetup();
    this.companyFacade.getIndustry();
  }

  selectTab(id: number): void {
    if (this.activeTab === id) return;
    this.activeTab = id;
    this.saveSuccess = false;
  }

  /** Called by Profile subtab when company is updated */
  onProfileUpdate(event: any): void {
    // Refresh store so Brand/Benefits panels reflect the latest data
    this.companyFacade.getCompany();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subs$.unsubscribe();
    if (this.saveResetTimer) {
      clearTimeout(this.saveResetTimer);
    }
  }
}
