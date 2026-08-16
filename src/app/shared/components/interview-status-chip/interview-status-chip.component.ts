import { Component, Input } from '@angular/core';
import { InterviewDisplayStatus } from '@app-shared/interview-scheduling/interview-scheduling.models';

/**
 * Status chip for a scheduled interview's `displayStatus`. Conveys status
 * with shape (icon) + border + color together, never color alone, per the
 * MVP's accessibility bar.
 */
@Component({
  selector: 'app-interview-status-chip',
  templateUrl: './interview-status-chip.component.html',
  styleUrls: ['./interview-status-chip.component.scss'],
})
export class InterviewStatusChipComponent {
  @Input() status: InterviewDisplayStatus = 'scheduled';

  get label(): string {
    switch (this.status) {
      case 'past': return 'Past';
      case 'cancelled': return 'Cancelled';
      default: return 'Scheduled';
    }
  }
}
