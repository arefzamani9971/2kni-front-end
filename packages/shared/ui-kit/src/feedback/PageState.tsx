import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { Skeleton } from '../primitives/Skeleton';
import { Spinner } from '../primitives/Spinner';
import type { PageStateProps } from './PageState.types';
import { DEFAULTS } from './PageState.constants';

/** Shared page states (page-contracts): loading skeleton, empty with action, error/offline/permission/etc. */
export function PageState({ kind, title, description, action, rows = 3, className }: PageStateProps) {
  if (kind === 'loading') {
    return (
      <div className={cn('flex flex-col gap-3', className)} aria-busy="true" aria-label="در حال بارگذاری">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }
  const d = DEFAULTS[kind];
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn('flex flex-col items-center gap-3 px-4 py-10 text-center', className)}
    >
      <span className="bg-brand-subtle text-fg-brand flex size-14 items-center justify-center rounded-full">
        {kind === 'unknown-result' ? <Spinner size={28} /> : <Icon name={d.icon} size={28} />}
      </span>
      <p className="text-heading-s text-fg-primary">{title ?? d.title}</p>
      {(description ?? d.description) ? (
        <p className="text-body-m text-fg-secondary max-w-80">{description ?? d.description}</p>
      ) : null}
      {action ? <div className="mt-2 flex w-full max-w-80 flex-col gap-2">{action}</div> : null}
    </div>
  );
}
