import { cn } from '../lib/cn';

/** Loading placeholder shaped like the content it replaces (page-contracts: skeleton of the same area). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-muted', className)} />;
}
