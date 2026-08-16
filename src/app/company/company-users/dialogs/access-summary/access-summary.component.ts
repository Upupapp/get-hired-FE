import { Component, Input, OnChanges } from '@angular/core';
import * as TeamModel from '../../../team-access.model';

interface CategoryDef {
  key: string;
  label: string;
  prefixes: string[];
}

const CATEGORIES: CategoryDef[] = [
  { key: 'jobs', label: 'Jobs', prefixes: ['jobs.'] },
  { key: 'applicants', label: 'Applicants', prefixes: ['applicants.'] },
  { key: 'cv', label: 'CVs & documents', prefixes: ['cv.'] },
  { key: 'messages', label: 'Messaging', prefixes: ['messages.'] },
  { key: 'interviews', label: 'Interviews', prefixes: ['interviews.'] },
  { key: 'company', label: 'Company profile', prefixes: ['company.'] },
  { key: 'team', label: 'Team & Access', prefixes: ['team.'] },
  { key: 'billing', label: 'Billing', prefixes: ['billing.'] },
];

@Component({
  selector: 'app-access-summary',
  templateUrl: './access-summary.component.html',
  styleUrls: ['./access-summary.component.scss']
})
export class AccessSummaryComponent implements OnChanges {
  @Input() role: TeamModel.TeamRole | null = null;
  @Input() accessScope: TeamModel.AccessScope | null = null;
  @Input() assignedJobCount = 0;

  scopeSentence = '';
  includedLabels: string[] = [];
  excludedLabels: string[] = [];
  showBroadAccessWarning = false;

  ngOnChanges(): void {
    this.scopeSentence = this.buildScopeSentence();
    const keys = this.role ? this.role.permissionKeys : [];
    this.includedLabels = CATEGORIES
      .filter(c => keys.some(k => c.prefixes.some(p => k.startsWith(p))))
      .map(c => c.label);
    this.excludedLabels = CATEGORIES
      .filter(c => !keys.some(k => c.prefixes.some(p => k.startsWith(p))))
      .map(c => c.label);
    const hasSensitive = keys.some(k => k === 'cv.view' || k.indexOf('billing.') === 0 || k.indexOf('team.') === 0);
    this.showBroadAccessWarning = this.accessScope === 'all_jobs' && hasSensitive;
  }

  private buildScopeSentence(): string {
    if (this.accessScope === 'all_jobs') {
      return 'This member can access all current and future job posts based on their role.';
    }
    if (this.accessScope === 'assigned_jobs') {
      const n = this.assignedJobCount;
      return n > 0
        ? `This member can access ${n} assigned job post${n !== 1 ? 's' : ''} only.`
        : 'This member will have no job access until you assign at least one job post.';
    }
    if (this.accessScope === 'no_job_access') {
      return 'This member will not see any job posts or applicants.';
    }
    return '';
  }
}
