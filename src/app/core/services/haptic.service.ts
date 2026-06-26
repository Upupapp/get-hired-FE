import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class HapticService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private vibrate(pattern: number[]): void {
    if (!isPlatformBrowser(this.platformId)) { return; }
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (_e) {
      // Haptics not supported — silently ignore
    }
  }

  success(): void {
    this.vibrate([50]);
  }

  error(): void {
    this.vibrate([100, 30, 80]);
  }

  warning(): void {
    this.vibrate([50, 30, 50]);
  }

  selection(): void {
    this.vibrate([20]);
  }
}
