'use client';
import { SearchField, Section } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';

/**
 * The search above a chosen catalog item (Search Field 1387:1505): editing it is a draft and Enter returns to the
 * results for the new text (PAT-FILTER-01 compact), so typing never leaves the item on the first key.
 */
export function SelectionSearch({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
}) {
  const t = useEntryTranslations();
  return (
    <Section title={t('findCatalog')} className="desktop:p-6">
      <form
        role="search"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <SearchField label={t('nameBarcodeSearch')} value={value} onChange={onChange} />
      </form>
    </Section>
  );
}
