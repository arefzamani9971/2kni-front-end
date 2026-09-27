import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Divider } from '../primitives/Divider';

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

/** Label/value pairs (review screens, invoice details). Numbers use tabular figures. */
export function KeyValueList({ items, className }: { items: readonly { label: ReactNode; value: ReactNode; emphasis?: boolean }[]; className?: string }) {
  return (
    <dl className={cn('flex w-full flex-col', className)}>
      {items.map((it, i) => (
        <div key={i} className="flex min-h-11 items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
          <dt className="text-body-m text-fg-secondary">{it.label}</dt>
          <dd className={cn('tabular text-end', it.emphasis ? 'text-heading-s text-fg-primary' : 'text-body-m text-fg-primary')}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Vertical stack of secondary actions (Figma «Additional / …»). */
export function ActionList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex w-full flex-col gap-3', className)}>{children}</div>;
}
