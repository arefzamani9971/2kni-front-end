'use client';
import { Section, SelectField } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** Goods or service; switching clears what a service cannot carry (the caller resets the draft). */
export function EntryKindSection({
  kind,
  onChange,
}: {
  kind: 'Goods' | 'Service';
  onChange: (kind: 'Goods' | 'Service') => void;
}) {
  const t = useEntryTranslations();
  return (
    <Section title={t('entryKind')}>
      <SelectField
        label={t('entryKind')}
        value={kind}
        options={[
          { value: 'Goods', label: t('goods') },
          { value: 'Service', label: t('service') },
        ]}
        onChange={(value) => onChange(value === 'Service' ? 'Service' : 'Goods')}
      />
    </Section>
  );
}
