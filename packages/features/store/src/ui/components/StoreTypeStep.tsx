'use client';
import { useStoreTranslations } from '../i18n/use-store-translations';

import { Button, FlowShell, PageState, RadioGroup } from '@dukani/ui-kit';
import { useState } from 'react';
import type { StoreType } from '../../application/ports';
import { useStorePresentation } from '../i18n/use-store-presentation';

export function StoreTypeStep({
  types,
  loading,
  value,
  onPick,
  onBack,
}: {
  types: readonly StoreType[];
  loading: boolean;
  value: string;
  onPick: (t: StoreType) => void;
  onBack: () => void;
}) {
  const t = useStoreTranslations();
  const presentation = useStorePresentation();

  const [choice, setChoice] = useState(value || types[0]?.id || '');
  const chosen = types.find((t) => t.id === choice);
  return (
    <FlowShell
      appBar={{ title: t('storeType'), back: onBack }}
      actions={
        <Button block disabled={!chosen} onClick={() => chosen && onPick(chosen)}>
          {chosen ? t('selectNamedType', { name: chosen.name }) : t('chooseType')}
        </Button>
      }
    >
      <h1 className="text-heading-l text-fg-primary">{t('storeType')}</h1>
      <p className="text-body-m text-fg-secondary">{t('typeHint')}</p>
      {loading ? (
        <PageState kind="loading" rows={4} />
      ) : (
        <RadioGroup
          label={t('storeType')}
          indicator={false}
          value={choice}
          onChange={setChoice}
          options={types.map((t) => ({
            value: t.id,
            label: t.name,
            description: presentation.typeHint(t.key),
          }))}
        />
      )}
    </FlowShell>
  );
}
