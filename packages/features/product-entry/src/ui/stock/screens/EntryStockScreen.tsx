'use client';
import { useEntryTranslations } from '../../i18n/use-entry-translations';

import { PageState } from '@dukani/ui-kit';
import { useState } from 'react';
import { EntryShell } from '../../common/components/EntryShell';
import { MissingDraft } from '../../common/components/MissingDraft';
import { EntryDraftRecovery } from '../../common/components/EntryDraftRecovery';
import { OriginStep } from '../components/OriginStep';
import { StockForm } from '../components/StockForm';
import { useEntryDraft } from '../../common/hooks/use-entry-draft';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import type { Kind } from '../types/EntryStockScreen.types';

/** stock (Figma 312:9170) → opening (312:9236) / new purchase, with cost status (312:9267) and details (358:494). */
export function EntryStockScreen({ draftId }: { draftId: string }) {
  const t = useEntryTranslations();

  const { draft, loading, error, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  const [kind, setKind] = useState<Kind | 'origin' | null>(null);
  if (error) return <PageState kind="error" />;
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft)
    return (
      <EntryShell title={t('addStock')}>
        <PageState kind="loading" />
      </EntryShell>
    );
  if (draft.pending || draft.result) return <EntryDraftRecovery draft={draft} />;
  const chosen = kind === 'origin' ? null : (kind ?? draft.stockEditor?.kind ?? draft.stock?.kind ?? null);
  if (!chosen) return <OriginStep draft={draft} onPick={setKind} save={save} />;
  return (
    <StockForm
      key={chosen}
      draft={draft}
      kind={chosen}
      save={save}
      onChangeOrigin={() => setKind('origin')}
    />
  );
}
