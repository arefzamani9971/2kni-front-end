'use client';
import { BarcodeField, ListRow, Section } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import type { DetailsForm } from '../types/NewItemDetails.types';

/** Manufacturer barcode of the base unit (goods only). */
export function DetailsBarcodeSection({ form }: { form: DetailsForm }) {
  const t = useEntryTranslations();
  return (
    <Section title={t('barcode')}>
      <form.Field name="barcode">
        {(f) => <BarcodeField {...f} label={t('manufacturerBarcode')} optional />}
      </form.Field>
      <ListRow>{t('hasBarcode')}</ListRow>
      <ListRow>{t('internalBarcodeHint')}</ListRow>
    </Section>
  );
}
