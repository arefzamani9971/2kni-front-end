'use client';
import type { ReactNode } from 'react';
import { createAdaptive } from '../responsive/adaptive';
import { ProductDataRow } from './ProductDataRow';
import { Badge } from '../primitives/Badge';
import { Link } from '../primitives/Link';
type Props = { title: string; subtitle?: string; description?: ReactNode; href: string };
/** Figma category 358:486/5349: mobile data row, desktop compact identity card. */
function Row({ title, subtitle, description, href }: Props) {
  return (
    <ProductDataRow title={title} subtitle={subtitle} meta={description} metaTone="warning" href={href} />
  );
}
function Card({ title, subtitle, description, href }: Props) {
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
export const RecordCard = createAdaptive<Props>('RecordCard', { mobile: Row, desktop: Card });
