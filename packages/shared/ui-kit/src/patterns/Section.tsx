import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Content card (Figma sections such as «کارهای روزانه»): surface, 1px border, radius 12, padding 16, gap 12. */
export function Section({
  title,
  description,
  actions,
  children,
  className,
  as: Tag = 'section',
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'fieldset';
}) {
  return (
    <Tag className={cn('flex w-full flex-col gap-3 rounded-md border border-line bg-surface p-4', className)}>
      {title || actions ? (
        <div className="flex items-center gap-2">
          {title ? <h2 className="flex-1 text-heading-m text-fg-primary">{title}</h2> : null}
          {actions}
        </div>
      ) : null}
      {description ? <p className="text-body-m text-fg-secondary">{description}</p> : null}
      {children}
    </Tag>
  );
}
