import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { recommendRole, RoleRecommendationAnswers, RoleRecommendationResult } from './role-recommendation';
import * as TeamModel from '@app-company/team-access.model';
import { HapticService } from '@app-core/services/haptic.service';

@Component({
  selector: 'app-help-choose-role',
  templateUrl: './help-choose-role.component.html',
  styleUrls: ['./help-choose-role.component.scss']
})
export class HelpChooseRoleComponent implements OnChanges {
  @Input() open = false;
  @Input() roles: TeamModel.TeamRole[] = [];
  @Output() openChange = new EventEmitter<boolean>();
  @Output() applyRecommendation = new EventEmitter<{ roleKey: string; scope: TeamModel.AccessScope }>();

  // This drawer is a plain *ngIf panel, not a MatDialog, so it doesn't get
  // Angular Material's automatic focus trap / Escape-to-close / focus-restore
  // for free -- wired up manually here.
  @ViewChild('drawerEl') drawerEl?: ElementRef<HTMLElement>;
  private lastFocusedEl: HTMLElement | null = null;

  answers: RoleRecommendationAnswers = {
    reviewApplicants: false,
    editJobs: false,
    scheduleInterviews: false,
    messageApplicants: false,
    manageBilling: false,
    manageTeamAccess: false,
    manageCompanyProfile: false,
    needsCvAccess: false,
    jobScope: 'assigned_jobs',
  };

  result: RoleRecommendationResult | null = null;

  constructor(private hapticService: HapticService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) { return; }
    if (this.open) {
      this.lastFocusedEl = document.activeElement as HTMLElement;
      setTimeout(() => this.drawerEl?.nativeElement.querySelector<HTMLElement>('.hcr-close')?.focus());
    } else if (this.lastFocusedEl) {
      this.lastFocusedEl.focus();
      this.lastFocusedEl = null;
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab' || !this.drawerEl) { return; }
    const focusables = Array.from(
      this.drawerEl.nativeElement.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.hasAttribute('disabled'));
    if (focusables.length === 0) { return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  close(): void {
    this.open = false;
    this.openChange.emit(false);
    this.result = null;
  }

  getRecommendation(): void {
    this.result = recommendRole(this.answers);
  }

  get recommendedRoleName(): string {
    if (!this.result) { return ''; }
    const match = this.roles.find(r => r.roleKey === this.result.roleKey);
    return match ? match.name : this.result.roleKey;
  }

  apply(): void {
    if (!this.result) { return; }
    // Never auto-applies without this explicit click -- getRecommendation()
    // only computes a suggestion; the member/invite still requires the
    // employer to press this button.
    this.hapticService.selection();
    this.applyRecommendation.emit({ roleKey: this.result.roleKey, scope: this.result.scope });
    this.close();
  }

  startOver(): void {
    this.result = null;
  }
}
