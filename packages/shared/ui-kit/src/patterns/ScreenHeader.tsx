import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Tab-screen header (Figma «Header»): title 20/DemiBold + context line 12/Medium («دکانی · نوشت‌افزار آفتاب»).
 * Desktop (pages 16/18 «Header», 110px): padding 24, title Heading/XL.
 */
export function ScreenHeader({ title, subtitle, actions, className }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn('flex w-full items-start gap-2 bg-surface p-4 desktop:p-6', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h1 className="text-heading-l text-fg-primary desktop:text-heading-xl">{title}</h1>
        {subtitle ? <p className="text-label-s text-fg-secondary">{subtitle}</p> : null}
      </div>
      {actions}
    </header>
  );
}
