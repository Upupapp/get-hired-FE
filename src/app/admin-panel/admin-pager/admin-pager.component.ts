import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-pager',
  templateUrl: './admin-pager.component.html',
  styleUrls: ['./admin-pager.component.scss']
})
export class AdminPagerComponent {
  @Input() page = 1;
  @Input() pageSize = 25;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();

  get pageCount(): number {
    if (!this.pageSize) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get rangeLabel(): string {
    if (!this.total) {
      return '0 results';
    }
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.total);
    return `${start}–${end} of ${this.total}`;
  }
}
