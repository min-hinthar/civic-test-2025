'use client';

import { useEffect, useRef } from 'react';

interface TipJarWidgetProps {
  mode: 'floating' | 'inline' | 'button';
  username: string;
  /** Floating-mode options */
  position?: 'bottom-right' | 'bottom-left';
  xMargin?: number;
  yMargin?: number;
  message?: string;
  /** Button-mode options */
  buttonText?: string;
  buttonColor?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
}

/**
 * Loads the TipTopJar widget script dynamically.
 *
 * - `floating`: Creates a fixed-position overlay button (rendered by the script itself).
 * - `inline`: Renders an embedded tip card inside the container div.
 * - `button`: Renders a styled tip button.
 */
export function TipJarWidget({
  mode,
  username,
  position = 'bottom-right',
  xMargin = 18,
  yMargin = 18,
  message,
  buttonText,
  buttonColor,
  buttonSize,
}: TipJarWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://tiptopjar.com/widget.js';
    script.async = true;
    script.dataset.username = username;
    script.dataset.mode = mode;

    if (mode === 'floating') {
      script.setAttribute('data-position', position);
      script.setAttribute('data-x_margin', String(xMargin));
      script.setAttribute('data-y_margin', String(yMargin));
      if (message) script.setAttribute('data-message', message);
    }

    if (mode === 'button') {
      if (buttonText) script.setAttribute('data-button-text', buttonText);
      if (buttonColor) script.setAttribute('data-button-color', buttonColor);
      if (buttonSize) script.setAttribute('data-button-size', buttonSize);
    }

    container.appendChild(script);

    return () => {
      // Clean up the script and any elements the widget injected
      container.innerHTML = '';
      // Floating mode may create elements outside the container
      if (mode === 'floating') {
        document
          .querySelectorAll('[id*="tiptopjar"], [class*="tiptopjar"]')
          .forEach(el => el.remove());
      }
    };
  }, [mode, username, position, xMargin, yMargin, message]);

  return <div ref={containerRef} />;
}
