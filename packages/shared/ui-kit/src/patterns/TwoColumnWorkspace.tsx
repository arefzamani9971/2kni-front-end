import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Figma desktop «Two-column workspace» (setup 312:208, review screens): «Primary» 693 at the start edge and
 * «Secondary» 443 at the end edge, 24px apart (kept as a 693:443 ratio of the content width). Mobile: one
 * column, primary first; `secondary` is desktop-only unless `secondaryOnMobile`.
 */
export function TwoColumnWorkspace({
  primary,
  secondary,
  secondaryOnMobile = false,
  className,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  secondaryOnMobile?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'desktop:grid desktop:grid-cols-[minmax(0,693fr)_minmax(0,443fr)] desktop:items-start desktop:gap-6 flex flex-col gap-3',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3">{primary}</div>
      {secondary ? (
        <div className={cn('flex min-w-0 flex-col gap-4', !secondaryOnMobile && 'desktop:flex hidden')}>{secondary}</div>
      ) : null}
    </div>
  );
}
