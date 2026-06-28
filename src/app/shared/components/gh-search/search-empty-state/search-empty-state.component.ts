import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-search-empty-state',
  templateUrl: './search-empty-state.component.html',
  styleUrls: ['./search-empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchEmptyStateComponent {
  @Input() query = '';
  @Input() hasFilters = false;
  @Output() clearFilters = new EventEmitter<void>();
  @Output() browseAll = new EventEmitter<void>();
}
