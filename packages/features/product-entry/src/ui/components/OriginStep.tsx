'use client';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { decimal } from '@dukani/domain';
import { Button, ListRow, Section } from '@dukani/ui-kit';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { baseUnitNameOf, entryUnitsOf, nextStep, titleOf } from '../../domain/entry-draft';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import type { Kind } from './OriginStep.types';
import type { Save } from '../common/types/use-entry-draft.types';

export function OriginStep({
  draft,
  onPick,
  save,
}: {
  draft: EntryDraft;
  onPick: (k: Kind) => void;
  save: Save;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();

  const go = useEntryNav();
  const units = entryUnitsOf(draft).filter((u) => !decimal.eq(u.baseQty, decimal.of(1)));
  const base = baseUnitNameOf(draft);
  return (
    <EntryShell title={t('addStock')} actions={<BackButton onClick={go.back} />}>
      <Section title={t('stockOrigin')}>
        <Button variant="secondary" block onClick={() => onPick('Opening')}>
          {t('existingStock')}
        </Button>
        <Button variant="secondary" block onClick={() => onPick('Purchase')}>
          {t('newPurchase')}
        </Button>
      </Section>
      <Section title={t('selectedProduct')}>
        <ListRow>{titleOf(draft)}</ListRow>
        <ListRow>
          {units
            .map((u) => t('unitConversion', { name: u.name, quantity: presentation.qty(u.baseQty), base }))
            .join(' · ')}
          {units.length ? ' · ' : ''}
          {t('stockBasedOn')}
          {base}
        </ListRow>
      </Section>
      <Button
        variant="text"
        block
        onClick={async () => {
          const d = await save((x) => ({ ...x, stock: null, stockDecided: true }));
          if (d) go.step(d.id, nextStep(d, 'stock'));
        }}
      >
        {t('withoutStock')}
      </Button>
    </EntryShell>
  );
}
