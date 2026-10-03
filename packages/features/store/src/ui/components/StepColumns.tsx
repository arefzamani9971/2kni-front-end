import { cn } from '@dukani/ui-kit';
import type { ReactNode } from 'react';

/**
 * Desktop body of the store setup steps (Figma 16 — 358:5344/5345, 597:4205/4269): the form fills the main
 * column (689fr, start edge) and the side column (439fr) stays free; `wide` children span both columns.
 * Mobile: one column.
 */
export function StepColumns({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'desktop:grid desktop:grid-cols-[minmax(0,689fr)_minmax(0,439fr)] desktop:items-start desktop:gap-x-6 flex flex-col gap-3',
        'desktop:*:col-start-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A StepColumns child that spans both desktop columns (Figma upload area). */
export const WIDE = 'desktop:col-span-2';

/** In-content secondary actions: full width on mobile, label-sized at the start edge on desktop. */
export const INLINE_ACTION = 'desktop:w-auto desktop:justify-self-start';
