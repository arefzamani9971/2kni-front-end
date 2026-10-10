'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { RecordListProps } from './RecordList.types';
/** Figma catalog list 358:485/5348 and type schema 358:487/5350: cards on mobile, table on desktop. */
function Cards({ rows, label }: RecordListProps) {
  return (
    <div aria-label={label} className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.id}>{row.card}</div>
      ))}
    </div>
  );
}
function Table({ rows, columns, label }: RecordListProps) {
  return (
    <div className="border-line overflow-auto rounded-lg border">
      <table className="bg-surface w-full border-collapse text-start">
        <caption className="sr-only">{label}</caption>
        <thead className="bg-muted text-fg-secondary text-label-s">
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className="h-14 px-4 text-start font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-line border-t">
              {row.cells.map((cell, index) => (
                <td key={index} className="text-body-m h-16 px-4 text-start">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export const RecordList = createAdaptive<RecordListProps>('RecordList', { mobile: Cards, desktop: Table });
