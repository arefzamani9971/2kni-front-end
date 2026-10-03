'use client';
import { useId, useState, type ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

/**
 * Content card (Figma sections such as «کارهای روزانه»): surface, 1px border, radius 12, padding 16, gap 12.
 * `collapsible` is Figma «Dukani/Form Accordion» (595:377, 595:407…): the ⌃ title toggles the group; a
 * collapsed group keeps its fields mounted, so typed values survive (Figma: «states preserve form fields»).
 */
export function Section({
  title,
  description,
  actions,
  children,
  className,
  as: Tag = 'section',
  collapsible = false,
  defaultOpen = true,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'fieldset';
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const expanded = !collapsible || open;
  return (
    <Tag
      className={cn(
        'border-line bg-surface flex w-full flex-col rounded-md border p-4',
        collapsible ? 'gap-4' : 'gap-3',
        className,
      )}
    >
      {title || actions ? (
        <div className="flex items-center gap-2">
          {title && collapsible ? (
            <h2 className="flex-1">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={bodyId}
                onClick={() => setOpen((o) => !o)}
                className="text-heading-m text-fg-primary focus-visible:outline-focus flex w-full items-center gap-2 rounded-sm text-start focus-visible:outline-2"
              >
                <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} />
                <span className="flex-1">{title}</span>
              </button>
            </h2>
          ) : title ? (
            <h2 className="text-heading-m text-fg-primary flex-1">{title}</h2>
          ) : null}
          {actions}
        </div>
      ) : null}
      <div id={bodyId} hidden={!expanded} className={cn('contents', !expanded && 'hidden')}>
        {description ? <p className="text-body-m text-fg-secondary">{description}</p> : null}
        {children}
      </div>
    </Tag>
  );
}
