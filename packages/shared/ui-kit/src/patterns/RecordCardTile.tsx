'use client';
import { Badge } from '../primitives/Badge';
import { Link } from '../primitives/Link';
import type { RecordCardProps } from './RecordCard.types';

/** Figma category 358:5349: a compact identity card on desktop. */
export function RecordCardTile({ title, subtitle, description, href }: RecordCardProps) {
  return (
    <Link
      href={href}
      className="border-line bg-muted hover:bg-surface focus-visible:outline-focus flex flex-col gap-2 rounded-md border p-4 text-start focus-visible:outline-2"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-heading-s text-fg-primary">{title}</span>
        {subtitle ? <Badge>{subtitle}</Badge> : null}
      </span>
      {description ? <span className="text-body-s text-fg-secondary">{description}</span> : null}
    </Link>
  );
}
