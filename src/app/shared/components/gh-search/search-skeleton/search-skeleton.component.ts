import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-search-skeleton',
  templateUrl: './search-skeleton.component.html',
  styleUrls: ['./search-skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchSkeletonComponent {
  @Input() count = 5;
  get items(): number[] { return Array(this.count).fill(0); }
}
