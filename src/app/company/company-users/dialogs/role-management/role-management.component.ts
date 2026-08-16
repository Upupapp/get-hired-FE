import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompanyFacade } from '@app-company/state/company.facade';
import * as TeamModel from '@app-company/team-access.model';
import { ROLE_GROUPS, CUSTOM_ROLE_GROUP, groupKeyForRole, groupLabelFor } from '@app-company/role-groups';
import { RoleBuilderComponent, RoleBuilderMode } from '../role-builder/role-builder.component';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { HapticService } from '@app-core/services/haptic.service';

interface RoleGroupView {
  key: string;
  label: string;
  roles: TeamModel.TeamRole[];
}

@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss'],
  animations: [mainAnimations]
})
export class RoleManagementComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  roles: TeamModel.TeamRole[] = [];
  myPermissionKeys: string[] = [];
  groups: RoleGroupView[] = [];
  expanded: { [key: string]: boolean } = {};
  loading = true;

  constructor(
    private companyFacade: CompanyFacade,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private hapticService: HapticService,
  ) {}

  ngOnInit(): void {
    this.companyFacade.getTeamRoles();
    this.companyFacade.teamRoles$.pipe(takeUntil(this.unsubscribe$)).subscribe(roles => {
      this.roles = roles || [];
      this.loading = false;
      this.buildGroups();
    });

    this.companyFacade.users$.pipe(takeUntil(this.unsubscribe$)).subscribe(members => {
      let currentUid = '';
      try {
        const raw = localStorage.getItem('user');
        if (raw) { const u = JSON.parse(raw); currentUid = u._id || u.id || u.uid || ''; }
      } catch (_) {}
      const self = (members || []).find(m => m.uid === currentUid);
      const myRole = self && this.roles.find(r => r.roleId === self.roleId);
      this.myPermissionKeys = myRole ? myRole.permissionKeys : [];
    });

    this.companyFacade.teamActionSuccess$.pipe(
      filter(s => s === 'custom_role_archived'),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.hapticService.success();
      this.snackbarService.success('Role archived.');
      this.companyFacade.getTeamRoles();
    });
  }

  private buildGroups(): void {
    const byGroup: { [key: string]: TeamModel.TeamRole[] } = {};
    for (const role of this.roles) {
      const key = groupKeyForRole(role);
      if (!byGroup[key]) { byGroup[key] = []; }
      byGroup[key].push(role);
    }
    this.groups = Object.keys(byGroup).map(key => ({ key, label: groupLabelFor(key), roles: byGroup[key] }));
    for (const g of this.groups) {
      if (this.expanded[g.key] === undefined) { this.expanded[g.key] = true; }
    }
  }

  toggleGroup(key: string): void {
    this.expanded[key] = !this.expanded[key];
  }

  openBuilder(mode: RoleBuilderMode, role?: TeamModel.TeamRole): void {
    this.dialog.open(RoleBuilderComponent, {
      width: '38vw',
      maxWidth: '100vw',
      maxHeight: '90vh',
      data: { mode, sourceRole: role, myPermissionKeys: this.myPermissionKeys },
    }).afterClosed().subscribe((saved) => {
      if (saved) { this.companyFacade.getTeamRoles(); }
    });
  }

  archiveRole(role: TeamModel.TeamRole): void {
    if (!confirm(`Archive "${role.name}"? Existing members keep their access; this role just won't be assignable to new invites.`)) { return; }
    this.companyFacade.archiveCustomRole(role.roleId);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
