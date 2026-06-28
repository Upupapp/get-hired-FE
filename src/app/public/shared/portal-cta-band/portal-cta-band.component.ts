import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Reusable final-CTA band, shared across the 3 new portal pages. */
@Component({
  selector: 'app-portal-cta-band',
  templateUrl: './portal-cta-band.component.html',
  styleUrls: ['./portal-cta-band.component.scss'],
})
export class PortalCtaBandComponent {
  @Input() title!: string;
  @Input() description?: string;
  @Input() primaryLabel!: string;
  @Input() secondaryLabel?: string;
  /** When provided, the primary CTA renders as <a routerLink> (crawlable). */
  @Input() primaryRoute?: string;
  @Input() primaryQueryParams?: Record<string, any>;
  /** When provided, the secondary CTA renders as <a routerLink> (crawlable). */
  @Input() secondaryRoute?: string;
  @Input() secondaryQueryParams?: Record<string, any>;
  @Output() primaryClick = new EventEmitter<void>();
  @Output() secondaryClick = new EventEmitter<void>();
}
