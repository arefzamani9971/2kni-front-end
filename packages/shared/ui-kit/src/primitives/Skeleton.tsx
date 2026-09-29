import { cn } from '../lib/cn';

/**
 * Loading placeholder shaped like the content it replaces (page-contracts: skeleton of the same area).
 * Figma `Dukani/Skeleton` (635:597): slate-100 blocks, 800 ms pulse; static under prefers-reduced-motion.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-skeleton rounded-md bg-disabled motion-reduce:animate-none', className)} />;
}
