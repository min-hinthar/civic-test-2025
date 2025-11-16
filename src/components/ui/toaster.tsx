'use client';

import clsx from 'clsx';
import { useToastStream } from './use-toast';

const variantStyles: Record<string, string> = {
  default: 'bg-slate-900 text-white',
  destructive: 'bg-red-600 text-white',
};

export const Toaster = () => {
  const { queue } = useToastStream();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-3">
      {queue.map(toast => (
        <div
          key={toast.id}
          className={clsx(
            'rounded-lg px-4 py-3 shadow-lg transition-all duration-300',
            variantStyles[toast.variant ?? 'default']
          )}
        >
          {toast.title && <p className="font-semibold">{toast.title}</p>}
          {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
};

export default Toaster;
