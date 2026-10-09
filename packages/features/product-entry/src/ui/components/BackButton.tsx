'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { Button } from '@dukani/ui-kit';

export function BackButton({ onClick, label }: { onClick: () => void; label?: string }) {
  const t = useEntryTranslations();
  label ??= t('back');

  return (
    <Button type="button" variant="secondary" block onClick={onClick}>
      {label}
    </Button>
  );
}
