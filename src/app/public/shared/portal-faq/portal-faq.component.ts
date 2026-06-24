import { Component, EventEmitter, Input, Output } from '@angular/core';

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
  /** Emits the question text when an item is opened (not on close) --
   * left for the parent page to forward to analytics, since this
   * component is shared across pages and shouldn't know which one it's on. */
  @Output() itemOpened = new EventEmitter<string>();
  openIndex: number | null = null;

  toggle(index: number): void {
    const opening = this.openIndex !== index;
    this.openIndex = opening ? index : null;
    if (opening) {
      this.itemOpened.emit(this.items[index]?.question);
    }
  }
}
