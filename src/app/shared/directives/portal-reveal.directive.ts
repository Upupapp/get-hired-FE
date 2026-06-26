import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Adds 'is-revealed' to the host element the first time it enters the
 * viewport (10% threshold), then disconnects. Also emits (revealed) for
 * analytics callers that want to react to the event.
 *
 * SSR-safe: on the server or in browsers without IntersectionObserver
 * support, adds is-revealed immediately so content is never permanently
 * invisible. Companion CSS in _portal-common.scss drives the transition.
 *
 * Usage:
 *   <section class="portal-reveal-section" appPortalReveal
 *            (revealed)="onSectionViewed()">
 */
@Directive({ selector: '[appPortalReveal]' })
export class PortalRevealDirective implements OnInit, OnDestroy {
  @Output() revealed = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') {
      this.el.nativeElement.classList.add('is-revealed');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          this.el.nativeElement.classList.add('is-revealed');
          this.revealed.emit();
          if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
          }
        }
      },
      { threshold: 0.1 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
