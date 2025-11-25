export {};

declare global {
  namespace google.accounts.id {
    type UxMode = 'popup' | 'redirect';
    type ContextMode = 'signin' | 'signup' | 'use';

    interface CredentialResponse {
      credential: string;
      select_by?: string;
      clientId?: string;
    }

    interface PromptMomentNotification {
      isDisplayMoment: () => boolean;
      isDisplayed: () => boolean;
      isNotDisplayed: () => boolean;
      getNotDisplayedReason?: () => string;
      isSkippedMoment: () => boolean;
      getSkippedReason?: () => string;
    }

    interface IdConfiguration {
      client_id: string;
      callback: (response: CredentialResponse) => void;
      cancel_on_tap_outside?: boolean;
      context?: ContextMode;
      ux_mode?: UxMode;
    }

    function initialize(options: IdConfiguration): void;
    function prompt(callback?: (notification: PromptMomentNotification) => void): void;
    function renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  }

  interface Window {
    google?: typeof google;
  }
}
