import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

/**
 * Fires `(viewedOnce)` the first time the host element becomes at least
 * 40% visible in the viewport, then disconnects -- the lightweight
 * "section viewed" analytics primitive flagged as missing in the GH1 WOW
 * upgrade's backlog (no IntersectionObserver-based tracking existed
 * anywhere in this app before this). Deliberately a directive, not a
 * service, so it can be dropped onto any section with zero component
 * wiring beyond a single template attribute + event binding.
 *
 * No-op safe: if IntersectionObserver isn't available (very old browser),
 * simply never fires -- never throws, never blocks rendering.
 */
@Directive({
  selector: '[appViewedOnce]',
})
export class ViewedOnceDirective implements OnInit, OnDestroy {
  @Output() viewedOnce = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          this.viewedOnce.emit();
          this.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
