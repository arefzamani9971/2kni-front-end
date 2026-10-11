import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Figma «Persistent actions»: white bar, padding 16, gap 8, above the safe area and the keyboard;
 * the primary action first. It never covers the focused field (the scroll area ends above it).
 * Desktop (pages 16/18, 72px): one row at the start edge, buttons sized to their label (Figma «محتوای منعطف»),
 * secondary outermost — pass them in the same order as on mobile (primary first); CSS handles the row.
 */
export function StickyActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'pb-safe bg-surface flex w-full shrink-0 flex-col gap-2 px-4 pt-4',
        'desktop:flex-row-reverse desktop:justify-end desktop:gap-3 desktop:border-t desktop:border-line desktop:px-6 desktop:py-4 desktop:*:w-auto',
        className,
      )}
    >
      {children}
    </div>
  );
}
