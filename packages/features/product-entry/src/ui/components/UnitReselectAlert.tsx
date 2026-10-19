'use client';
import { Alert, Button } from '@dukani/ui-kit';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { useUnitReselect } from '../hooks/use-unit-reselect';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import type { Save } from './StockForm.types';

/** The review's stock unit is gone or no longer a purchase unit: the seller chooses again (F12 §12, scenario 15). */
export function UnitReselectAlert({ draft, save }: { draft: EntryDraft; save: Save }) {
  const t = useEntryTranslations();
  const unit = useUnitReselect(draft, save);
  return (
    <Alert
      tone="warning"
      title={t('unitStaleTitle')}
      description={unit.failed ? t('reselectFailed') : t('unitStaleHint')}
      action={
        <Button variant="secondary" loading={unit.loading} onClick={() => void unit.reselect()}>
          {t('reselectUnit')}
        </Button>
      }
    />
  );
}
