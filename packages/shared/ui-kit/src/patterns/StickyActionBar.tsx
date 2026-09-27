import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Figma «Persistent actions»: white bar, padding 16, gap 8, above the safe area and the keyboard;
 * the primary action first. It never covers the focused field (the scroll area ends above it).
 */
export function StickyActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('pb-safe flex w-full shrink-0 flex-col gap-2 bg-surface px-4 pt-4', className)}>{children}</div>;
}
