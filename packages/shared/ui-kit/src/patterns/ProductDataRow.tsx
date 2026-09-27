import type { ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { Link } from '../primitives/Link';
import type { Tone } from '../lib/types';

export type ProductDataRowProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  metaTone?: Tone;
  /** Image URL, or the first letter of the title is shown on a brand-subtle tile. */
  imageUrl?: string | null;
  initial?: string;
  badge?: ReactNode;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
  trailing?: ReactNode;
  className?: string;
};

const META_TONE: Record<Tone, string> = {
  neutral: 'text-fg-secondary',
  brand: 'text-fg-brand',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};

/** Figma `Product Data Row` (118:2): thumbnail 52, title 14/Medium, subtitle 12/Medium, meta 14, chevron. */
export function ProductDataRow(props: ProductDataRowProps) {
  const initial = props.initial ?? (typeof props.title === 'string' ? props.title.trim().charAt(0) : '');
  const body = (
    <>
      <span className="flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-subtle text-label-m text-fg-brand">
        {props.imageUrl ? <img src={props.imageUrl} alt="" className="size-full object-cover" /> : initial}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
        <span className="flex items-center gap-2">
          <span className="truncate text-label-m text-fg-primary">{props.title}</span>
          {props.badge}
        </span>
        {props.subtitle ? <span className="text-label-s text-fg-primary">{props.subtitle}</span> : null}
        {props.meta ? <span className={cn('text-body-m', META_TONE[props.metaTone ?? 'neutral'])}>{props.meta}</span> : null}
      </span>
      {props.trailing ?? (props.href || props.onClick ? <Icon name="chevron-end" size={20} className="text-icon" /> : null)}
    </>
  );
  const classes = cn(
    'flex w-full items-center gap-3 rounded-lg border bg-surface p-3',
    props.selected ? 'border-focus bg-brand-subtle shadow-[inset_0_0_0_1px_var(--dukani-color-border-focus)]' : 'border-line',
    (props.href || props.onClick) && 'transition-colors hover:bg-muted',
    props.className,
  );
  if (props.href) return <Link href={props.href} className={classes}>{body}</Link>;
  if (props.onClick) {
    return (
      <button type="button" onClick={props.onClick} aria-pressed={props.selected} className={classes}>
        {body}
      </button>
    );
  }
  return <div className={classes}>{body}</div>;
}
