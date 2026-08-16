import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { CompanyFacade } from '@app-company/state/company.facade';
import { ImportAddUserComponent } from './dialogs/import-add-user.component/import-add-user.component';
import { EditTeamMemberComponent } from './dialogs/edit-team-member.component/edit-team-member.component';
import { RoleManagementComponent } from './dialogs/role-management/role-management.component';
import { AuditLogComponent } from './dialogs/audit-log/audit-log.component';
import { SubscriptionAlertComponent } from '@app-shared/components/subscription-alert/subscription-alert.component';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { HapticService } from '@app-core/services/haptic.service';
import * as Model from '../company.model';
import * as TeamModel from '../team-access.model';

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
  pendingInvites$ = this.companyFacade.pendingInvites$;
  loading = true;
  currentUserUid = '';

  // A member without team.manage sees no row-action menu at all. V1 approximation:
  // only the current user's own membership row (loaded via users$) carries a real
  // roleKey, so we derive "can manage" from whether that row is an owner/admin role.
  canManageTeam = false;

  constructor(
    private companyFacade: CompanyFacade,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private hapticService: HapticService,
  ) {}

  ngOnInit(): void {
    this.companyFacade.getCompanyUsers(this.companyId);
    this.companyFacade.getPendingInvites();

    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        this.currentUserUid = u._id || u.id || u.uid || '';
      }
    } catch (_) {}

    this.users$.pipe(takeUntil(this.unsubscribe$)).subscribe(members => {
      const self = (members || []).find(m => m.uid === this.currentUserUid);
      this.canManageTeam = !!self && (self.roleKey === 'owner' || self.roleKey === 'company_admin');
    });

    this.companyFacade.teamActionSuccess$.pipe(
      filter(s => s === 'member_removed' || s === 'invite_revoked'),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.companyFacade.getCompanyUsers(this.companyId);
      this.companyFacade.getPendingInvites();
    });

    this.companyFacade.teamActionSuccess$.pipe(
      filter(s => s === 'invite_revoked' || s === 'invite_resent' || s === 'member_suspended' || s === 'member_reactivated'),
      takeUntil(this.unsubscribe$)
    ).subscribe((s) => {
      if (s === 'invite_revoked' || s === 'member_suspended') {
        this.hapticService.warning();
      } else {
        this.hapticService.success();
      }
    });

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
      width: '34vw',
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
      width: '34vw',
      maxWidth: '100vw',
      maxHeight: '90vh',
    });
  }

  editMember(member: Model.CompanyUser): void {
    this.dialog.open(EditTeamMemberComponent, {
      width: '34vw',
      maxWidth: '100vw',
      maxHeight: '90vh',
      data: { member },
    });
  }

  removeMember(member: Model.CompanyUser): void {
    if (!confirm(`Remove ${member.fullName || member.email} from this company? They will immediately lose all access.`)) {
      return;
    }
    this.companyFacade.removeTeamMember(member.employeeId);
    this.hapticService.warning();
  }

  suspendMember(member: Model.CompanyUser): void {
    if (!confirm(`Suspend ${member.fullName || member.email}? They immediately lose access, but their role, access scope, and job assignments stay saved -- reactivating restores it all, no re-invite needed.`)) {
      return;
    }
    this.companyFacade.suspendTeamMember(member.employeeId);
  }

  reactivateMember(member: Model.CompanyUser): void {
    this.companyFacade.reactivateTeamMember(member.employeeId);
  }

  revokeInvite(invite: TeamModel.TeamInvitation): void {
    if (!confirm(`Revoke the invite sent to ${invite.email}?`)) {
      return;
    }
    this.companyFacade.revokeInvite(invite.invitationId);
  }

  resendInvite(invite: TeamModel.TeamInvitation): void {
    this.companyFacade.resendInvite(invite.invitationId);
  }

  openRoleManagement(): void {
    this.dialog.open(RoleManagementComponent, {
      width: '44vw',
      maxWidth: '100vw',
      maxHeight: '90vh',
    });
  }

  openAuditLog(): void {
    this.dialog.open(AuditLogComponent, {
      width: '40vw',
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
