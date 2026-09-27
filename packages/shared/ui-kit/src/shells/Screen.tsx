import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Mobile screen frame (390×844 reference): header, independently scrolling content, persistent
 * actions and bottom navigation. On wide screens the mobile column is centered until the desktop
 * shell (Figma page 16) is implemented.
 */
export function Screen({
  header,
  actions,
  nav,
  banner,
  children,
  contentClassName,
  className,
}: {
  header?: ReactNode;
  actions?: ReactNode;
  nav?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto flex h-dvh w-full max-w-[480px] flex-col bg-canvas md:border-x md:border-line', className)}>
      {header ? <div className="shrink-0">{header}</div> : null}
      {banner}
      <main className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4', contentClassName)}>{children}</main>
      {actions}
      {nav}
    </div>
  );
}

/** Header wrapper used by flow and auth screens (Figma «Header»: white, padding 16, holds the App Bar). */
export function ScreenTop({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-3 bg-surface p-4', className)}>{children}</div>;
}
