import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { AUTH_ROLE_TABS, AuthRole } from '@app-shared/utils/auth-role-query';

@Component({
  selector: 'app-auth-role-tabs',
  templateUrl: './auth-role-tabs.component.html',
  styleUrls: ['./auth-role-tabs.component.scss'],
})
export class AuthRoleTabsComponent {
  @Input() activeRole: AuthRole = 3;
  @Input() idPrefix = 'auth';
  @Input() ariaLabel = 'Account type';
  @Output() roleSelected = new EventEmitter<AuthRole>();
  @ViewChildren('tabButton') tabButtons?: QueryList<ElementRef<HTMLButtonElement>>;

  readonly tabs = AUTH_ROLE_TABS;

  tabId(role: AuthRole): string {
    return `${this.idPrefix}-tab-${role}`;
  }

  get panelId(): string {
    return `${this.idPrefix}-panel`;
  }

  select(role: AuthRole): void {
    this.roleSelected.emit(role);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const nextIndex = this.nextIndex(event.key, index);
    if (nextIndex == null) {
      return;
    }
    event.preventDefault();
    const next = this.tabs[nextIndex];
    this.roleSelected.emit(next.role);
    const buttons = this.tabButtons;
    setTimeout(() => buttons?.get(nextIndex)?.nativeElement.focus());
  }

  private nextIndex(key: string, index: number): number | null {
    const last = this.tabs.length - 1;
    if (key === 'ArrowRight') {
      return index === last ? 0 : index + 1;
    }
    if (key === 'ArrowLeft') {
      return index === 0 ? last : index - 1;
    }
    if (key === 'Home') {
      return 0;
    }
    if (key === 'End') {
      return last;
    }
    return null;
  }
}
