import {
  Component, Input, Output, EventEmitter,
  ElementRef, ViewChild, PLATFORM_ID, Inject, AfterViewInit, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-google-signin-button',
  templateUrl: './google-signin-button.component.html',
  styleUrls: ['./google-signin-button.component.scss']
})
export class GoogleSigninButtonComponent implements AfterViewInit, OnDestroy {
  @Input() label: 'continue_with' | 'signup_with' | 'signin_with' = 'continue_with';
  @Input() disabled = false;
  @Input() fullWidth = true;
  // Emits the Google credential (ID token JWT) when user completes sign-in
  @Output() credential = new EventEmitter<string>();
  @Output() errorEvent = new EventEmitter<string>();

  @ViewChild('gisContainer') containerRef!: ElementRef<HTMLDivElement>;

  gisReady = false;
  private _pollInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.waitForGIS();
  }

  private waitForGIS(): void {
    if ((window as any).google) {
      this.mountButton();
      return;
    }
    var attempts = 0;
    this._pollInterval = setInterval(() => {
      attempts++;
      if ((window as any).google) {
        clearInterval(this._pollInterval);
        this.mountButton();
      } else if (attempts > 40) {
        clearInterval(this._pollInterval);
      }
    }, 100);
  }

  private handleCredential(response: google.accounts.id.CredentialResponse): void {
    if (response && response.credential) {
      this.credential.emit(response.credential);
    } else {
      this.errorEvent.emit('google_popup_closed');
    }
  }

  private mountButton(): void {
    if (!this.containerRef || !this.containerRef.nativeElement) return;
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleCredential.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const width = this.fullWidth
        ? Math.min((this.containerRef.nativeElement.parentElement || this.containerRef.nativeElement).offsetWidth || 340, 400)
        : 320;

      google.accounts.id.renderButton(this.containerRef.nativeElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: this.label,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: width > 60 ? width : 340
      });
      this.gisReady = true;
    } catch (e) {
      console.error('[GoogleSigninButton] mount error:', e);
    }
  }

  ngOnDestroy(): void {
    if (this._pollInterval) clearInterval(this._pollInterval);
  }
}
