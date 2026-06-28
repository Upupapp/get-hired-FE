import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-gh-responsive-image',
  templateUrl: './gh-responsive-image.component.html',
  styleUrls: ['./gh-responsive-image.component.scss']
})
export class GhResponsiveImageComponent implements OnChanges {
  @Input() src: string = '';
  @Input() srcset: string = '';
  @Input() sizes: string = '(max-width: 480px) 480px, (max-width: 768px) 768px, 100vw';
  @Input() alt: string = '';
  @Input() fallback: string = '';
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  @Input() width: number | null = null;
  @Input() height: number | null = null;
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' | 'circle' = 'none';
  @Input() fit: 'cover' | 'contain' | 'scale-down' = 'cover';

  displaySrc: string = '';
  hasError: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] || changes['fallback']) {
      this.displaySrc = this.src || this.fallback || '';
      this.hasError = false;
    }
  }

  onError(): void {
    if (this.fallback && this.displaySrc !== this.fallback) {
      this.displaySrc = this.fallback;
    } else {
      this.hasError = true;
    }
  }

  get radiusClass(): string {
    const map: Record<string, string> = {
      none:   '',
      sm:     'gh-ri--sm',
      md:     'gh-ri--md',
      lg:     'gh-ri--lg',
      circle: 'gh-ri--circle',
    };
    return map[this.rounded] || '';
  }

  get fitClass(): string {
    const map: Record<string, string> = {
      cover:      'gh-ri--cover',
      contain:    'gh-ri--contain',
      'scale-down': 'gh-ri--scale-down',
    };
    return map[this.fit] || 'gh-ri--cover';
  }
}
