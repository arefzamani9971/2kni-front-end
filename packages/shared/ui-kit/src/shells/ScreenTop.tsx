import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Header wrapper used by flow and auth screens (Figma «Header»: white, padding 16, holds the App Bar). */
export function ScreenTop({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-3 bg-surface p-4', className)}>{children}</div>;
}
