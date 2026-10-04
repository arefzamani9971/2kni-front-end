import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { SUMMARY_CARD } from './ContentColumns.constants';

/**
 * Figma desktop «Content columns» (AUTH-01 359:1693, storeselect 359:1735): «Details» fills the start side and a
 * 340px «Summary» card sits at the end edge, 12px apart. The summary is desktop-only (the mobile frames have no
 * such card); on mobile only the details are shown.
 */
export function ContentColumns({
  summary,
  children,
  className,
}: {
  summary?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'desktop:grid desktop:grid-cols-[minmax(0,1fr)_340px] desktop:items-start desktop:gap-3 flex flex-col gap-3',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
      {summary ? <aside className={cn(SUMMARY_CARD, 'desktop:flex hidden')}>{summary}</aside> : null}
    </div>
  );
}
