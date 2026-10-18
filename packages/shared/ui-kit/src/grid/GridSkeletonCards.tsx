import { Skeleton } from '../primitives/Skeleton';

/** First-page placeholder shaped like the mobile cards. */
export function GridSkeletonCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          aria-hidden
          className="bg-surface border-line flex flex-col gap-3 rounded-sm border p-4"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </li>
      ))}
    </>
  );
}
