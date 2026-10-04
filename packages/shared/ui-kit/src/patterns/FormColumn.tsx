import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Desktop form column of the settings-style steps: the form group sits at the start edge with a fixed width and
 * the rest of the row stays empty — `lg` 760 (storeprofile 358:5344, storelegal 358:5345), `md` 680
 * (storelocation 597:4205, storehours 597:4269). `wide` children (Figma upload area) span the whole row, and
 * inline actions keep their label width at the start edge. Mobile: full width.
 */
export function FormColumn({
  size = 'lg',
  wide,
  children,
  className,
}: {
  size?: 'md' | 'lg';
  /** Full-width content above the column (e.g. «Dukani/Upload Area»). */
  wide?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      {wide}
      <div
        className={cn(
          'desktop:items-start flex w-full flex-col gap-3',
          size === 'lg' ? 'desktop:max-w-[760px]' : 'desktop:max-w-[680px]',
        )}
      >
        {children}
      </div>
    </div>
  );
}
