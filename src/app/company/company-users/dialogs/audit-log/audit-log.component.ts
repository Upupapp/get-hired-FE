import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompanyFacade } from '@app-company/state/company.facade';
import * as TeamModel from '@app-company/team-access.model';

const EVENT_LABELS: { [eventType: string]: string } = {
  invite_sent: 'Invite sent',
  invite_accepted: 'Invite accepted',
  invite_revoked: 'Invite revoked',
  role_changed: 'Role changed',
  scope_changed: 'Access scope changed',
  jobs_assigned: 'Job assignments changed',
  member_removed: 'Member removed',
  member_suspended: 'Member suspended',
  member_reactivated: 'Member reactivated',
  custom_role_created: 'Custom role created',
  custom_role_updated: 'Custom role updated',
  custom_role_archived: 'Custom role archived',
};

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss'],
  animations: [mainAnimations]
})
export class AuditLogComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  logs$ = this.companyFacade.auditLogs$;
  loading = true;

  constructor(private companyFacade: CompanyFacade) {}

  ngOnInit(): void {
    this.companyFacade.getAuditLogs();
    this.logs$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => this.loading = false);
  }

  labelFor(entry: TeamModel.AuditLogEntry): string {
    return EVENT_LABELS[entry.eventType] || entry.eventType;
  }

  actorLabel(entry: TeamModel.AuditLogEntry): string {
    return entry.actorEmail || entry.actorUid || 'Unknown';
  }

  targetLabel(entry: TeamModel.AuditLogEntry): string | null {
    return entry.targetEmail || entry.targetUid || null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
