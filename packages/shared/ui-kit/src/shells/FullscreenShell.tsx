import type { ReactNode } from 'react';

/** Full-screen scanner with an explicit exit. */
export function FullscreenShell({ children, onExit, exitLabel = 'خروج از اسکن' }: { children: ReactNode; onExit: () => void; exitLabel?: string }) {
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-black text-fg-inverse">
      <div className="flex h-14 items-center px-2">
        <button type="button" onClick={onExit} className="h-11 rounded-md px-3 text-label-m text-fg-inverse hover:bg-white/10">
          {exitLabel}
        </button>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}
