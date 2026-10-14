'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { decimal } from '@dukani/domain';
import { Alert, Button, ListRow, Section, TextField } from '@dukani/ui-kit';
import { nextStep } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useState } from 'react';
import type { Save } from './CatalogDetails.types';

export function CatalogDetails({ draft, save }: { draft: EntryDraft; save: Save }) {
  const t = useEntryTranslations();

  const go = useEntryNav();
  const item = draft.catalog!;
  const [localTitle, setLocalTitle] = useState(draft.localTitle);
  const packs = item.units.filter((u) => !decimal.eq(u.baseQty, decimal.of(1)));
  const next = async () => {
    const d = await save((x) => ({ ...x, localTitle }));
    if (d) go.step(d.id, nextStep(d, 'details'));
  };
  return (
    <EntryShell
      mobileNav={draft.intent !== 'standalone'}
      title={t('selectCatalog')}
      actions={
        <>
          <Button block onClick={next}>
            {t(draft.intent === 'standalone' ? 'reviewContinue' : 'continueStock')}
          </Button>
          <BackButton onClick={go.back} />
        </>
      }
    >
      <Section title={item.title}>
        <ListRow>
          {t('type')}
          {item.typeName}
          {item.brandName ? t('brandSuffix', { name: item.brandName }) : ''}
        </ListRow>
        <ListRow>
          {t('unitsLabel')}
          {item.baseUnitName}
          {packs.length ? ` (${packs.map((p) => p.name).join('، ')})` : ''}
        </ListRow>
      </Section>
      {item.storeProductId ? (
        <Alert
          tone="info"
          title={t('alreadyInStore')}
          description={t(draft.intent === 'standalone' ? 'standaloneUnchanged' : 'existingHint')}
        />
      ) : (
        <Section title={t('inStore')}>
          <TextField
            label={t('displayName')}
            optional
            value={localTitle}
            onChange={setLocalTitle}
            placeholder={item.title}
            maxLength={160}
            hint={t('displayNameHint')}
          />
        </Section>
      )}
    </EntryShell>
  );
}
