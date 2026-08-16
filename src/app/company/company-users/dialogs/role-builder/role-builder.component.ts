import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompanyFacade } from '@app-company/state/company.facade';
import * as TeamModel from '@app-company/team-access.model';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { HapticService } from '@app-core/services/haptic.service';

export type RoleBuilderMode = 'create' | 'clone' | 'edit';

@Component({
  selector: 'app-role-builder',
  templateUrl: './role-builder.component.html',
  styleUrls: ['./role-builder.component.scss'],
  animations: [mainAnimations]
})
export class RoleBuilderComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  mode: RoleBuilderMode;
  sourceRole: TeamModel.TeamRole | null;
  myPermissionKeys: string[] = [];

  name = '';
  description = '';
  selectedKeys: string[] = [];
  allPermissions: TeamModel.PermissionDef[] = [];
  saving = false;
  showImpactPreview = false;

  constructor(
    public dialogRef: MatDialogRef<RoleBuilderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: RoleBuilderMode; sourceRole?: TeamModel.TeamRole; myPermissionKeys: string[] },
    private companyFacade: CompanyFacade,
    private snackbarService: SnackbarService,
    private hapticService: HapticService,
  ) {}

  ngOnInit(): void {
    this.mode = this.data.mode;
    this.sourceRole = this.data.sourceRole || null;
    this.myPermissionKeys = this.data.myPermissionKeys || [];

    if (this.mode === 'clone' && this.sourceRole) {
      this.name = `${this.sourceRole.name} (Copy)`;
      this.description = this.sourceRole.description;
      this.selectedKeys = [...this.sourceRole.permissionKeys];
    } else if (this.mode === 'edit' && this.sourceRole) {
      this.name = this.sourceRole.name;
      this.description = this.sourceRole.description;
      this.selectedKeys = [...this.sourceRole.permissionKeys];
    }

    this.companyFacade.getPermissionCatalog();
    this.companyFacade.permissionCatalog$.pipe(takeUntil(this.unsubscribe$)).subscribe(perms => {
      this.allPermissions = perms || [];
    });

    this.companyFacade.teamActionSuccess$.pipe(
      filter(s => s === 'custom_role_created' || s === 'custom_role_updated'),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.saving = false;
      this.hapticService.success();
      this.snackbarService.success(this.mode === 'edit' ? 'Role updated.' : 'Custom role created.');
      this.dialogRef.close(true);
    });

    this.companyFacade.teamActionError$.pipe(
      filter(e => !!e),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.saving = false;
      this.hapticService.error();
      this.snackbarService.error("Unable to save this role. You may be trying to grant a permission you don't have.");
    });
  }

  get canSave(): boolean {
    return this.name.trim().length > 0 && this.selectedKeys.length > 0;
  }

  onSelectedKeysChange(keys: string[]): void {
    this.selectedKeys = keys;
  }

  toggleImpactPreview(): void {
    this.showImpactPreview = !this.showImpactPreview;
  }

  save(): void {
    if (!this.canSave) { return; }
    this.saving = true;

    if (this.mode === 'edit' && this.sourceRole) {
      this.companyFacade.updateCustomRole(this.sourceRole.roleId, {
        name: this.name.trim(),
        description: this.description.trim(),
        permissionKeys: this.selectedKeys,
      });
    } else {
      this.companyFacade.createCustomRole({
        name: this.name.trim(),
        description: this.description.trim(),
        permissionKeys: this.selectedKeys,
      });
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
