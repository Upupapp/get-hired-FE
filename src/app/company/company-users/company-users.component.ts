import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { CompanyFacade } from '@app-company/state/company.facade';
import { CompanyService } from '../company.service';
import { ImportAddUserComponent } from './dialogs/import-add-user.component/import-add-user.component';
import { SubscriptionAlertComponent } from '@app-shared/components/subscription-alert/subscription-alert.component';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { mainAnimations } from '@main/shared/animations/main-animations';
import * as Model from '../company.model';

@Component({
  selector: 'app-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss'],
  animations: [mainAnimations]
})
export class CompanyUsersComponent implements OnInit, OnDestroy {
  @Input() companyId: string;

  subscriptions$ = new Subscription();
  private unsubscribe$ = new Subject<void>();

  users$ = this.companyFacade.users$;
  loading = true;
  currentUserUid = '';

  removingUid = '';

  constructor(
    private companyFacade: CompanyFacade,
    private companyService: CompanyService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.companyFacade.getCompanyUsers(this.companyId);

    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        this.currentUserUid = u._id || u.id || u.uid || '';
      }
    } catch (_) {}

    setTimeout(() => this.loading = false, 1500);
  }

  getInitials(fullName: string): string {
    if (!fullName) { return '?'; }
    const parts = fullName.trim().split(' ');
    const first = (parts[0] || '').charAt(0).toUpperCase();
    const last = (parts[1] || '').charAt(0).toUpperCase();
    return first + last || first;
  }

  openProfile(member: Model.CompanyUser): void {
    if (member.uid && member.uid === this.currentUserUid) {
      this.router.navigate(['/recruiter/company/settings'], { queryParams: { tab: 4 } });
    }
    // read-only view for other members: no-op in V1 (no profile drawer yet)
  }

  // BUGFIX: this tab had no way to remove a team member's access at all --
  // every row besides your own had zero controls. The backend already
  // fully and safely supports it (company.team.manage-gated, last-owner
  // protected, only ever deletes the company_employees membership row --
  // never the underlying user account), it just had no FE caller anywhere
  // in the app. You can't remove your own row here (matches "Edit my
  // profile" already being the only self-action) -- self-removal, if ever
  // needed, should go through a deliberate "leave company" flow, not this
  // list.
  removeMember(member: Model.CompanyUser): void {
    if (!member.uid || member.uid === this.currentUserUid) { return; }

    const ref = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        title: 'Remove team member?',
        message: `Remove ${member.fullName} from this company? They will immediately lose access to jobs, applicants, and company data. This does not delete their account.`,
        confirmLabel: 'Remove access',
        cancelLabel: 'Cancel',
        destructive: true,
      },
    });

    ref.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      if (result !== 1) { return; }
      this.removingUid = member.uid;
      this.companyService.removeCompanyUser(member.uid, this.companyId).subscribe({
        next: () => {
          this.removingUid = '';
          this.snackbarService.success(`${member.fullName} has been removed from this company.`, '');
          this.companyFacade.getCompanyUsers(this.companyId);
        },
        error: (err: any) => {
          this.removingUid = '';
          const message = err?.error?.error || err?.error?.message || 'Something went wrong. Please try again.';
          this.snackbarService.error(message, '');
        },
      });
    });
  }

  addAccess(): void {
    this.companyFacade.getCompanySubscription(this.companyId);
    this.companyFacade.subsRestrictions$.pipe(
      filter(subs => !!subs),
      take(1),
      takeUntil(this.unsubscribe$)
    ).subscribe(subs => this.checkSubs(subs));
  }

  checkSubs(subs: Model.CompanySubscriptions): void {
    if (subs) {
      if (subs.adminCount === subs.admin) {
        this.restrictUserCreation();
      } else {
        this.addUserToCompany();
      }
    }
  }

  restrictUserCreation(): void {
    const ref = this.dialog.open(SubscriptionAlertComponent, {
      // OVERLAY-AUDIT FIX: same narrow-viewport gap as job-list.component.ts's
      // identical SubscriptionAlertComponent dialog -- same fix.
      width: 'clamp(340px, 34vw, 480px)',
      data: { isError: true }
    });
    this.subscriptions$.add(
      ref.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
        if (result === 1) {
          this.router.navigate(['../../subscription'], { relativeTo: this.route });
        }
      })
    );
  }

  addUserToCompany(): void {
    this.dialog.open(ImportAddUserComponent, {
      // OVERLAY-AUDIT FIX: flat 34vw is too narrow at 768-900px for this
      // dialog's two-tab form content. Floor raised to 380px (wider than
      // the simple-alert dialogs above -- this one holds real form fields,
      // not just a heading and a button). maxWidth/maxHeight unchanged.
      width: 'clamp(380px, 34vw, 560px)',
      maxWidth: '100vw',
      maxHeight: '90vh',
    });
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
