'use client';

import { useEffect, useRef } from 'react';

interface TipJarWidgetProps {
  mode: 'inline' | 'button';
  username: string;
  /** Button-mode options */
  buttonText?: string;
  buttonColor?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
}

/**
 * Loads the TipTopJar widget script dynamically.
 *
 * - `inline`: Renders an embedded tip card inside the container div.
 * - `button`: Renders a styled tip button.
 */
export function TipJarWidget({
  mode,
  username,
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

    if (mode === 'button') {
      if (buttonText) script.setAttribute('data-button-text', buttonText);
      if (buttonColor) script.setAttribute('data-button-color', buttonColor);
      if (buttonSize) script.setAttribute('data-button-size', buttonSize);
    }

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [mode, username, buttonText, buttonColor, buttonSize]);

  return <div ref={containerRef} />;
}
