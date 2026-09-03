// Google Identity Services global type declarations
// Loaded via script tag in index.html (accounts.google.com/gsi/client)
declare namespace google {
  namespace accounts {
    namespace id {
      interface IdConfiguration {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        context?: 'signin' | 'signup' | 'use';
        itp_support?: boolean;
        nonce?: string;
      }
      interface CredentialResponse {
        credential: string;
        select_by?: string;
        clientId?: string;
      }
      function initialize(config: IdConfiguration): void;
      function prompt(callback?: (notification: PromptMomentNotification) => void): void;
      function renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
      function disableAutoSelect(): void;
      function cancel(): void;
      interface PromptMomentNotification {
        isDisplayMoment(): boolean;
        isDisplayed(): boolean;
        isNotDisplayed(): boolean;
        getNotDisplayedReason(): string;
        isSkippedMoment(): boolean;
        getSkippedReason(): string;
        isDismissedMoment(): boolean;
        getDismissedReason(): string;
        getMomentType(): string;
      }
      interface GsiButtonConfiguration {
        type?: 'standard' | 'icon';
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
        shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        logo_alignment?: 'left' | 'center';
        width?: number;
        locale?: string;
      }
    }
    // OAuth2 token-client surface — used by the custom (non-GIS-rendered)
    // Sign in with Google button. Distinct from `accounts.id` above: this
    // yields a Google OAuth access token, not a Google ID-token JWT.
    namespace oauth2 {
      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        prompt?: '' | 'none' | 'consent' | 'select_account';
        error_callback?: (error: ClientConfigError) => void;
      }
      interface TokenResponse {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
        error?: string;
        error_description?: string;
      }
      interface ClientConfigError {
        type: 'popup_failed_to_open' | 'popup_closed' | 'unknown';
        message?: string;
      }
      interface TokenClient {
        requestAccessToken(overrideConfig?: { prompt?: string }): void;
      }
      function initTokenClient(config: TokenClientConfig): TokenClient;
      function revoke(accessToken: string, done?: () => void): void;
    }
  }
}
