'use client';

/**
 * Three-dot typing indicator in a chat bubble shape.
 *
 * Matches examiner bubble styling (left-aligned, muted bg).
 * CSS animation: sequential dot bounce (dot 1, then 2, then 3, repeat).
 */
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="rounded-2xl rounded-tl-sm bg-muted/40 px-4 py-3">
        <style>{`
          @keyframes typing-bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-4px); }
          }
          .typing-dot {
            animation: typing-bounce 1.2s ease-in-out infinite;
          }
          .typing-dot:nth-child(2) { animation-delay: 0.15s; }
          .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        `}</style>
        <div className="flex gap-1" aria-label="Examiner is typing">
          <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/60" />
          <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/60" />
          <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/60" />
        </div>
      </div>
    </div>
  );
}
