'use client';
import { useValidationRules } from '@dukani/forms';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import { Button, ListRow, Section, BarcodeField } from '@dukani/ui-kit';
import { BackButton } from '../components/BackButton';
import { EntryShell } from '../components/EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { schema } from './EntryBarcodeScreen.schema';

/** barcode (Figma 358:490): manual barcode entry; the camera scanner (F08) reuses the same lookup. */
export function EntryBarcodeScreen() {
  const t = useEntryTranslations();

  const go = useEntryNav();
  const validationRules = useValidationRules();
  const form = useAppForm({ schema: schema(validationRules), defaultValues: { code: '' } });
  const submit = form.handleSubmit(({ code }) => go.search(code));
  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        title={t('manualBarcode')}
        actions={
          <>
            <Button type="submit" block>
              {t('checkBarcode')}
            </Button>
            <BackButton onClick={go.method} />
          </>
        }
      >
        <Section title={t('productBarcode')}>
          <form.Field name="code">
            {(f) => <BarcodeField {...f} label={t('packBarcode')} autoFocus required />}
          </form.Field>
          <ListRow>{t('barcodeOptional')}</ListRow>
        </Section>
      </EntryShell>
    </form>
  );
}
