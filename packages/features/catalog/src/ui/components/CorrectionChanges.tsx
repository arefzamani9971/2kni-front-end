'use client';
import { KeyValueList, Section } from '@dukani/ui-kit';
import type { CorrectionField, CorrectionRequest } from '../../domain/correction.types';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { useCorrectionPresentation } from '../i18n/use-correction-presentation';

/** Proposed values by field; names come from the item's capabilities when they can still be read. */
export function CorrectionChanges({
  changes,
  fields,
}: {
  changes: CorrectionRequest['proposedChanges'];
  fields: readonly CorrectionField[];
}) {
  const t = useCatalogTexts();
  const presentation = useCorrectionPresentation();
  const entries = Object.entries(changes).filter(([key]) => !key.startsWith('_'));
  if (entries.length === 0) return null;
  return (
    <Section title={t('correctionStatus.changes')}>
      <KeyValueList
        items={entries.map(([key, value]) => {
          const field = fields.find((f) => f.key === key);
          return {
            label: presentation.label(key, field),
            value: presentation.value(field, value) ?? t('correctionStatus.cleared'),
          };
        })}
      />
    </Section>
  );
}
