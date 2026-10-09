import { useUiTranslations } from '../i18n/use-ui-translations';
import type { ReactNode } from 'react';

/** Full-screen scanner with an explicit exit. */
export function FullscreenShell({
  children,
  onExit,
  exitLabel,
}: {
  children: ReactNode;
  onExit: () => void;
  exitLabel?: string;
}) {
  const t = useUiTranslations();
  exitLabel ??= t('controls.exitScan');

  return (
    <div className="text-fg-inverse fixed inset-0 z-30 flex flex-col bg-black">
      <div className="flex h-14 items-center px-2">
        <button
          type="button"
          onClick={onExit}
          className="text-label-m text-fg-inverse h-11 rounded-md px-3 hover:bg-white/10"
        >
          {exitLabel}
        </button>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}
