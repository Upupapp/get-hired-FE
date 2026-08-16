import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import * as TeamModel from '../../../team-access.model';
import { PERMISSION_CATEGORY_LABELS } from '../../../role-groups';

interface CategoryGroup {
  category: string;
  label: string;
  permissions: TeamModel.PermissionDef[];
}

@Component({
  selector: 'app-permission-matrix',
  templateUrl: './permission-matrix.component.html',
  styleUrls: ['./permission-matrix.component.scss']
})
export class PermissionMatrixComponent implements OnChanges {
  @Input() allPermissions: TeamModel.PermissionDef[] = [];
  @Input() selectedKeys: string[] = [];
  @Input() grantableKeys: string[] | null = null; // null = no restriction (e.g. viewing, not editing)
  @Input() readonly = false;
  @Output() selectedKeysChange = new EventEmitter<string[]>();

  categories: CategoryGroup[] = [];
  expanded: { [category: string]: boolean } = {};

  ngOnChanges(): void {
    const byCategory: { [category: string]: TeamModel.PermissionDef[] } = {};
    for (const p of this.allPermissions) {
      if (!byCategory[p.category]) { byCategory[p.category] = []; }
      byCategory[p.category].push(p);
    }
    this.categories = Object.keys(byCategory).map(category => ({
      category,
      label: PERMISSION_CATEGORY_LABELS[category] || category,
      permissions: byCategory[category],
    }));
    for (const c of this.categories) {
      if (this.expanded[c.category] === undefined) { this.expanded[c.category] = true; }
    }
  }

  isSensitive(key: string): boolean {
    return this.allPermissions.some(p => p.key === key && !!p.sensitive);
  }

  isSelected(key: string): boolean {
    return this.selectedKeys.indexOf(key) !== -1;
  }

  isGrantable(key: string): boolean {
    return this.grantableKeys === null || this.grantableKeys.indexOf(key) !== -1;
  }

  toggle(key: string): void {
    if (this.readonly || !this.isGrantable(key)) { return; }
    const next = this.isSelected(key)
      ? this.selectedKeys.filter(k => k !== key)
      : [...this.selectedKeys, key];
    this.selectedKeysChange.emit(next);
  }

  toggleCategory(category: string): void {
    this.expanded[category] = !this.expanded[category];
  }

  selectedCountFor(category: CategoryGroup): number {
    return category.permissions.filter(p => this.isSelected(p.key)).length;
  }
}
