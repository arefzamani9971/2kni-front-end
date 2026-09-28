import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export function ChipGroup({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {children}
    </div>
  );
}
