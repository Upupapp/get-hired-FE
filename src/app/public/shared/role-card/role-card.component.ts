import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Reusable card used by the main portal's role selector, and by the
 * benefit/feature grids on the job-seeker/employer portals. Always a real
 * keyboard-reachable button/link -- never a div with a click handler only
 * (GETHIRED_PORTAL_V2 accessibility rule: role cards must be links/buttons
 * with proper labels).
 */
@Component({
  selector: 'app-role-card',
  templateUrl: './role-card.component.html',
  styleUrls: ['./role-card.component.scss'],
})
export class RoleCardComponent {
  @Input() icon: string | null = null;
  @Input() title!: string;
  @Input() description!: string;
  @Input() ctaLabel!: string;
  @Input() ariaLabel?: string;
  @Output() activated = new EventEmitter<void>();

  onActivate(): void {
    this.activated.emit();
  }
}
