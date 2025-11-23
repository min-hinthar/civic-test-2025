export {};

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: Record<string, { postMessage: (payload: unknown) => void }>;
    };
    __WKWEBVIEW_ENABLED__?: boolean;
  }
}
