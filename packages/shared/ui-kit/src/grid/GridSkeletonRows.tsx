import { Skeleton } from '../primitives/Skeleton';

/** First-page placeholder with the table's own shape (page-contracts: a skeleton of the same area). */
export function GridSkeletonRows({ cells, rows }: { cells: number; rows: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} aria-hidden>
          {Array.from({ length: cells }, (_, cell) => (
            <td key={cell} className="h-16 px-3">
              <Skeleton className="h-4 w-full max-w-40" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
