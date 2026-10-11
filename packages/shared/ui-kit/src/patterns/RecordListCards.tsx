'use client';
import type { RecordListProps } from './RecordList.types';

/** Figma catalog list 358:485 / type schema 358:487: stacked cards on mobile. */
export function RecordListCards({ rows, label }: RecordListProps) {
  return (
    <div aria-label={label} className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.id}>{row.card}</div>
      ))}
    </div>
  );
}
