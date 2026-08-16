import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompanyFacade } from '@app-company/state/company.facade';
import * as Model from '@app-company/company.model';
import * as TeamModel from '@app-company/team-access.model';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { HapticService } from '@app-core/services/haptic.service';

@Component({
  selector: 'app-edit-team-member',
  templateUrl: './edit-team-member.component.html',
  styleUrls: ['./edit-team-member.component.scss'],
  animations: [mainAnimations]
})
export class EditTeamMemberComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  member: Model.CompanyUser;
  roles: TeamModel.TeamRole[] = [];
  selectedRoleId = '';
  selectedScope: TeamModel.AccessScope = 'all_jobs';
  selectedJobIds: string[] = [];
  saving = false;

  constructor(
    public dialogRef: MatDialogRef<EditTeamMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: Model.CompanyUser },
    private companyFacade: CompanyFacade,
    private snackbarService: SnackbarService,
    private hapticService: HapticService,
  ) {}

  ngOnInit(): void {
    this.member = this.data.member;
    this.selectedRoleId = this.member.roleId || '';
    this.selectedScope = this.member.accessScope || 'all_jobs';
    this.selectedJobIds = (this.member.assignedJobs || []).map(j => j.jobId);

    this.companyFacade.getTeamRoles();
    this.companyFacade.teamRoles$.pipe(takeUntil(this.unsubscribe$)).subscribe(roles => {
      this.roles = roles || [];
    });

    this.companyFacade.teamActionSuccess$.pipe(
      filter(s => s === 'member_updated'),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.saving = false;
      this.hapticService.success();
      this.snackbarService.success('Team member updated.');
      this.dialogRef.close(true);
    });

    this.companyFacade.teamActionError$.pipe(
      filter(e => !!e),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.saving = false;
      this.hapticService.error();
      this.snackbarService.error('Unable to update this member. Please try again.');
    });
  }

  get selectedRole(): TeamModel.TeamRole | null {
    return this.roles.find(r => r.roleId === this.selectedRoleId) || null;
  }

  get canSave(): boolean {
    if (!this.selectedRoleId) { return false; }
    if (this.selectedScope === 'assigned_jobs' && this.selectedJobIds.length === 0) { return false; }
    return true;
  }

  onScopeChange(scope: TeamModel.AccessScope): void {
    this.selectedScope = scope;
    if (scope !== 'assigned_jobs') {
      this.selectedJobIds = [];
    }
  }

  onJobIdsChange(jobIds: string[]): void {
    this.selectedJobIds = jobIds;
  }

  save(): void {
    if (!this.canSave) { return; }
    this.saving = true;
    this.companyFacade.updateTeamMember(this.member.employeeId, {
      roleId: this.selectedRoleId,
      accessScope: this.selectedScope,
      jobIds: this.selectedScope === 'assigned_jobs' ? this.selectedJobIds : undefined,
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
