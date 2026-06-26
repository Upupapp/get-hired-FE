import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {

  private readonly DEFAULT_DURATION = 4000;
  private readonly LONG_DURATION = 6000;

  constructor(
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  success(msg: string, action: string = '', duration: number = this.DEFAULT_DURATION): void {
    if (!isPlatformBrowser(this.platformId)) { return; }
    const config: MatSnackBarConfig = {
      duration,
      panelClass: ['success-snackbar'],
      politeness: 'polite',
    };
    this.snackBar.open(msg, action, config);
  }

  error(msg: string, action: string = '', duration: number = this.LONG_DURATION): void {
    if (!isPlatformBrowser(this.platformId)) { return; }
    const config: MatSnackBarConfig = {
      duration,
      panelClass: ['danger-snackbar'],
      politeness: 'assertive',
    };
    this.snackBar.open(msg, action, config);
  }

  warning(msg: string, action: string = '', duration: number = this.LONG_DURATION): void {
    if (!isPlatformBrowser(this.platformId)) { return; }
    const config: MatSnackBarConfig = {
      duration,
      panelClass: ['warning-snackbar'],
      politeness: 'polite',
    };
    this.snackBar.open(msg, action, config);
  }

  info(msg: string, action: string = '', duration: number = this.DEFAULT_DURATION): void {
    if (!isPlatformBrowser(this.platformId)) { return; }
    const config: MatSnackBarConfig = {
      duration,
      panelClass: ['info-snackbar'],
      politeness: 'polite',
    };
    this.snackBar.open(msg, action, config);
  }
}
