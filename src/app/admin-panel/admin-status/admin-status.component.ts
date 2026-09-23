import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-status',
  templateUrl: './admin-status.component.html',
  styleUrls: ['./admin-status.component.scss']
})
export class AdminStatusComponent {
  @Input() loading = false;
  @Input() error = '';
  @Input() empty = false;
  @Input() loadingText = 'Loading…';
  @Input() emptyText = 'Nothing to show yet.';
  @Output() retry = new EventEmitter<void>();
}
