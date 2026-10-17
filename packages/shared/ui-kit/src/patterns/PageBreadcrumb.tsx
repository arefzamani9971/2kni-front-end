import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Figma catalog 358:5348: the page trail above a desktop title (Label/S, tertiary). */
export function PageBreadcrumb({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('text-label-s text-fg-tertiary mb-1 block font-medium', className)}>{children}</span>;
}
