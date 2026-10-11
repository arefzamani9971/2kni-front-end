'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { Button } from '@dukani/ui-kit';

export function BackButton({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}) {
  const t = useEntryTranslations();
  label ??= t('back');

  return (
    <Button type="button" variant="secondary" block onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
}
