// Centralized utilities for safely interacting with WKWebView message handlers

type BridgePayload = unknown;

export function isWKWebView(): boolean {
  if (typeof window === 'undefined') return false;
  const hasHandlers = !!window.webkit?.messageHandlers;
  const hasNativeFlag = !!window.__WKWEBVIEW_ENABLED__;
  return hasHandlers || hasNativeFlag;
}

export function postToNative(handlerName: string, payload: BridgePayload): void {
  if (typeof window === 'undefined') return;

  const handler = window.webkit?.messageHandlers?.[handlerName];
  if (!handler) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[nativeBridge] Handler "${handlerName}" not available. Falling back.`);
    }
    return;
  }

  try {
    handler.postMessage(payload);
  } catch (err) {
    console.error(`[nativeBridge] Failed to post to "${handlerName}":`, err);
  }
}

export function runInWKWebView<T>(fn: () => T): T | undefined {
  if (!isWKWebView()) return undefined;
  return fn();
}
