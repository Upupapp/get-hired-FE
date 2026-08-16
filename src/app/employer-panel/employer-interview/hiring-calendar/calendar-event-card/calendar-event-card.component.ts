import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CUSTOM_INTERVIEW_TYPE, ScheduledInterview } from '@app-shared/interview-scheduling/interview-scheduling.models';
import { formatInTimeZone } from '@app-shared/interview-scheduling/interview-timezone.utils';

const FORMAT_LABELS: Record<string, string> = {
  video_call: 'Video Call',
  phone: 'Phone',
  in_person: 'In Person',
  custom: 'Custom',
};

/**
 * Shared event chip/block reused by Day, Week, and Month views. Status is
 * conveyed by both a CSS class (color) and a visible text label -- never
 * color alone, per the accessibility requirement. No employer-private
 * fields (meeting link, instructions) are shown in this dense summary --
 * only what the spec explicitly allows: time, applicant, job/type, status.
 */
@Component({
  selector: 'app-calendar-event-card',
  templateUrl: './calendar-event-card.component.html',
  styleUrls: ['./calendar-event-card.component.scss'],
})
export class CalendarEventCardComponent {
  @Input() interview!: ScheduledInterview;
  @Input() displayTimeZone!: string;
  @Input() compact = false;
  @Output() activated = new EventEmitter<void>();

  get applicantName(): string {
    return (this.interview.applicant && (this.interview.applicant.name || this.interview.applicant.email)) || 'Applicant';
  }

  get typeLabel(): string {
    return this.interview.interviewType === CUSTOM_INTERVIEW_TYPE && this.interview.customTypeLabel
      ? this.interview.customTypeLabel
      : this.interview.interviewType;
  }

  get formatLabel(): string {
    return FORMAT_LABELS[this.interview.format] || this.interview.format;
  }

  get timeLabel(): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: this.interview.timezone,
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(this.interview.startAt));
    } catch {
      return formatInTimeZone(this.interview.startAt, this.interview.timezone);
    }
  }

  get statusLabel(): string {
    if (this.interview.displayStatus === 'cancelled') { return 'Cancelled'; }
    if (this.interview.displayStatus === 'past') { return 'Past'; }
    return 'Scheduled';
  }

  get statusClass(): string {
    return 'cec-status--' + this.interview.displayStatus;
  }

  get ariaLabel(): string {
    return `${this.timeLabel}, ${this.applicantName}, ${this.interview.jobTitle}, ${this.typeLabel}, ${this.statusLabel}`;
  }

  activate(): void {
    this.activated.emit();
  }
}
