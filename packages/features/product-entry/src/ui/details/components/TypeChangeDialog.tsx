'use client';
import { ConfirmDialog } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';

/** Confirms a type change that would drop attribute values the new schema cannot keep (F06 §7). */
export function TypeChangeDialog({
  open,
  removedNames,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  removedNames: readonly string[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useEntryTranslations();
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      title={t('typeChangeTitle')}
      description={t('typeChangeHint')}
      confirmLabel={t('confirmTypeChange')}
      onConfirm={onConfirm}
    >
      <ul>
        {removedNames.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </ConfirmDialog>
  );
}
