import { cn } from '../lib/cn';

/**
 * Loading placeholder shaped like the content it replaces (page-contracts: skeleton of the same area).
 * Figma `Dukani/Skeleton` (635:597): slate-100 blocks, 800 ms pulse; static under prefers-reduced-motion.
 */
export function Skeleton({ className, motion = true }: { className?: string; motion?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-disabled rounded-md',
        motion && 'animate-skeleton motion-reduce:animate-none',
        className,
      )}
    />
  );
}
