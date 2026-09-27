import type { ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { Link } from '../primitives/Link';

/**
 * Card that navigates (Figma «storeselect» rows): avatar/initial, title, meta line, an accent call
 * to action and an end chevron. Renders a link when `href` is given, otherwise a button.
 */
export function NavCard({
  title,
  meta,
  cta,
  avatar,
  href,
  onClick,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  cta?: ReactNode;
  /** Initial letter or icon; defaults to the first letter of a string title. */
  avatar?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const initial = avatar ?? (typeof title === 'string' ? title.trim().charAt(0) : null);
  const body = (
    <>
      {initial ? (
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-heading-s text-fg-brand">
          {initial}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-label-l text-fg-primary">{title}</span>
        {meta ? <span className="text-body-s text-fg-secondary">{meta}</span> : null}
        {cta ? <span className="text-label-m text-accent">{cta}</span> : null}
      </span>
      <Icon name="chevron-end" size={20} className="text-icon" />
    </>
  );
  const classes = cn(
    'flex w-full items-center gap-3 rounded-lg border border-line bg-surface p-4 text-start transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-focus',
    className,
  );
  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={classes}>
      {body}
    </button>
  );
}
