'use client';
import { ProductDataRow } from './ProductDataRow';
import type { RecordCardProps } from './RecordCard.types';

/** Figma category 358:486: a data row on mobile. */
export function RecordCardRow({ title, subtitle, description, href }: RecordCardProps) {
  return (
    <ProductDataRow title={title} subtitle={subtitle} meta={description} metaTone="warning" href={href} />
  );
}
