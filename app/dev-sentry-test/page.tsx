'use client';

import { useState } from 'react';

function BuggyComponent(): React.JSX.Element {
  throw new Error('Sentry test: React render error');
}

export default function DevSentryTestPage() {
  const [renderError, setRenderError] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return <p>This page is only available in development mode.</p>;
  }

  if (renderError) {
    return <BuggyComponent />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sentry Test Page (Dev Only)</h1>
      <p>Click buttons to verify Sentry error capture:</p>
      <button
        onClick={() => {
          throw new Error('Sentry test: click handler error');
        }}
      >
        Throw in Click Handler
      </button>
      <button onClick={() => setRenderError(true)} style={{ marginLeft: '1rem' }}>
        Throw in Render
      </button>
    </div>
  );
}
