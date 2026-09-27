import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { IconButton } from '../primitives/IconButton';
import { Link } from '../primitives/Link';
import { Icon } from '../icons/Icon';

export type AppBarProps = {
  title: ReactNode;
  /** Back target: a URL or a handler. Omit for root screens. */
  back?: string | (() => void);
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
};

/** Figma `App Bar` (69:2): 56px, bottom border, back (44px) at the start, title 18/DemiBold. */
export function AppBar({ title, back, backLabel = 'بازگشت', actions, className }: AppBarProps) {
  return (
    <div className={cn('flex h-14 w-full items-center gap-2 border-b border-line bg-surface px-2', className)}>
      {typeof back === 'string' ? (
        <Link href={back} aria-label={backLabel} className="inline-flex size-11 items-center justify-center rounded-md text-icon hover:bg-muted">
          <Icon name="back" size={24} />
        </Link>
      ) : back ? (
        <IconButton icon="back" label={backLabel} onClick={back} />
      ) : null}
      <h1 className="min-w-0 flex-1 truncate text-heading-m text-fg-primary">{title}</h1>
      {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
    </div>
  );
}

/** Tab-screen header (Figma «Header»): title 20/DemiBold + context line 12/Medium («دکانی · نوشت‌افزار آفتاب»). */
export function ScreenHeader({ title, subtitle, actions, className }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn('flex w-full items-start gap-2 bg-surface p-4', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h1 className="text-heading-l text-fg-primary">{title}</h1>
        {subtitle ? <p className="text-label-s text-fg-secondary">{subtitle}</p> : null}
      </div>
      {actions}
    </header>
  );
}
