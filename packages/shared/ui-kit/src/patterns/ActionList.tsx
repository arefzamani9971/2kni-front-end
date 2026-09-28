import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Vertical stack of secondary actions (Figma «Additional / …»). */
export function ActionList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex w-full flex-col gap-3', className)}>{children}</div>;
}
