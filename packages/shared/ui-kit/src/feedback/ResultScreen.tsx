import type { ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

/** Success screen with the next main action (e.g. «ثبت کالای بعدی», «فروش بعدی»). */
export function ResultScreen({
  title,
  description,
  children,
  tone = 'success',
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  tone?: 'success' | 'warning';
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
      <span className={cn('flex size-16 items-center justify-center rounded-full', tone === 'success' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning')}>
        <Icon name={tone === 'success' ? 'check-circle' : 'alert-warning'} size={34} />
      </span>
      <p className="text-heading-l text-fg-primary">{title}</p>
      {description ? <p className="text-body-m text-fg-secondary">{description}</p> : null}
      {children ? <div className="mt-2 w-full">{children}</div> : null}
    </div>
  );
}
