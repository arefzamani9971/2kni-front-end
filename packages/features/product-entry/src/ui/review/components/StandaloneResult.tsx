'use client';
import { Alert, Button, RecordList } from '@dukani/ui-kit';
import { useCan } from '@dukani/platform';
import { EntryShell } from '../../common/components/EntryShell';
import type { StandaloneResultProps } from '../types/StandaloneResult.types';
import { useStandaloneCompletion } from '../hooks/use-standalone-completion';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { STANDALONE_RESULT_COLUMN_KEYS } from '../constants/standalone-result.constants';

/**
 * CPB-D 1255:60 / CPB-M 1255:140: identity success, optional stock as a separate operation.
 * This single confirmation record keeps RecordList's table/card presentation; it needs no grid data source.
 */
export function StandaloneResult({ draft }: StandaloneResultProps) {
  const t = useEntryTranslations();
  const state = useStandaloneCompletion(draft);
  const canStock = useCan('purchase.manage');
  const result = draft.result!;
  const purchaseHost = !!draft.purchaseHostId || !!draft.continuousHost;
  return (
    <EntryShell
      title={t('standaloneSaved')}
      mobileNav={false}
      actions={
        <>
          {!purchaseHost && result.itemKind !== 'Service' && canStock ? (
            <Button block loading={state.busy} onClick={() => void state.complete(true)}>
              {t('recordStock')}
            </Button>
          ) : null}
          <Button block variant="secondary" disabled={state.busy} onClick={() => void state.complete(false)}>
            {t(purchaseHost ? 'returnPurchase' : 'notNow')}
          </Button>
        </>
      }
    >
      <Alert tone="success" title={t('standaloneSavedHint')} />
      <RecordList
        label={t('standaloneSaved')}
        columns={STANDALONE_RESULT_COLUMN_KEYS.map((key) => t(key))}
        rows={[
          {
            id: result.storeProductId,
            cells: [result.title, t('standaloneUnchanged')],
            card: (
              <section className="bg-surface border-line flex flex-col gap-2 rounded-md border p-4">
                <h2 className="text-label-m">{result.title}</h2>
                <p className="text-body-s text-fg-secondary">{t('standaloneUnchanged')}</p>
              </section>
            ),
          },
        ]}
      />
      {state.error ? <Alert tone="danger" title={t('startFailed')} /> : null}
    </EntryShell>
  );
}
