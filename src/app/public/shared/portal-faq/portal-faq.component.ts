import { Component, Input } from '@angular/core';

export interface PortalFaqItem {
  question: string;
  answer: string;
}

/** Accessible FAQ accordion -- keyboard-operable buttons, no focus traps. */
@Component({
  selector: 'app-portal-faq',
  templateUrl: './portal-faq.component.html',
  styleUrls: ['./portal-faq.component.scss'],
})
export class PortalFaqComponent {
  @Input() items: PortalFaqItem[] = [];
  openIndex: number | null = null;

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
