import { Component, Input } from '@angular/core';
import {
  BrandLogoTone,
  BrandLogoVariant,
  BRAND_LOGO_ALT,
  brandLogoSrc,
} from './brand-assets';

@Component({
  selector: 'app-brand-logo',
  templateUrl: './brand-logo.component.html',
  styleUrls: ['./brand-logo.component.scss'],
})
export class BrandLogoComponent {
  @Input() variant: BrandLogoVariant = 'horizontal';
  @Input() tone: BrandLogoTone = 'on-light';
  /** CSS height, e.g. 28 or '28px'. Width stays auto to preserve aspect ratio. */
  @Input() height: number | string = 28;
  /** When true, empty alt (decorative repeat). */
  @Input() decorative = false;
  @Input() alt = BRAND_LOGO_ALT;
  @Input() imgClass = '';

  get src(): string {
    return brandLogoSrc(this.variant, this.tone);
  }

  get resolvedAlt(): string {
    return this.decorative ? '' : this.alt;
  }

  get heightCss(): string {
    return typeof this.height === 'number' ? `${this.height}px` : this.height;
  }
}
