import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Divider } from '../primitives/Divider';

/** Text row with a divider (Figma «Row»). */
export function ListRow({ children, trailing, className }: { children: ReactNode; trailing?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <div className="flex min-h-6 items-center gap-2">
        <div className="min-w-0 flex-1 text-body-m text-fg-primary">{children}</div>
        {trailing}
      </div>
      <Divider />
    </div>
  );
}
