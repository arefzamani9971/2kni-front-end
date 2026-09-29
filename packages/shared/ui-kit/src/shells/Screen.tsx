import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Screen frame for both Figma viewports (one DOM, CSS `desktop:` switches the layout — no flash, no fork):
 * - Mobile (page 17, 390×844): header, independently scrolling content, persistent actions, bottom navigation.
 *   Between mobile and desktop widths the column stays centered (max 480).
 * - Desktop (pages 16/18, 1440×1024): sidebar (240, right in RTL) + main column; content padding 24
 *   (layout/padding/desktop); the bottom navigation is hidden, the sidebar replaces it.
 */
export function Screen({
  header,
  actions,
  nav,
  sidebar,
  banner,
  children,
  contentClassName,
  className,
}: {
  header?: ReactNode;
  actions?: ReactNode;
  nav?: ReactNode;
  /** Desktop navigation (`DesktopSidebar`); not rendered on mobile. */
  sidebar?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto flex h-dvh w-full max-w-[480px] flex-col bg-canvas md:border-x md:border-line',
        'desktop:max-w-none desktop:flex-row desktop:border-x-0',
        className,
      )}
    >
      {sidebar ? <div className="hidden desktop:flex">{sidebar}</div> : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {header ? <div className="shrink-0">{header}</div> : null}
        {banner}
        <main className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-layout', contentClassName)}>{children}</main>
        {actions}
        {nav ? <div className="shrink-0 desktop:hidden">{nav}</div> : null}
      </div>
    </div>
  );
}
