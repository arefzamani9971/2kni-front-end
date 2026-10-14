'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import type { DetailsOptionalProps } from './DetailsOptional.types';

/** Keeps optional identity metadata available without crowding the focused registration form. */
export function DetailsOptional({ collapsed, children }: DetailsOptionalProps) {
  const t = useEntryTranslations();
  if (!collapsed) return children;
  return (
    <details className="flex flex-col gap-4">
      <summary className="text-label-m text-fg-brand cursor-pointer rounded-md py-3 focus-visible:outline">
        {t('showOptional')}
      </summary>
      <div className="flex flex-col gap-4">{children}</div>
    </details>
  );
}
