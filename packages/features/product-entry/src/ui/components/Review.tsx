'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { useRef, useState } from 'react';
import { useAppQuery, useFinalCommand } from '@dukani/data';
import { fromApiMoney, type OperationId } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { Alert, Button, ListRow, PageState, Section } from '@dukani/ui-kit';
import type { EntryDraft, EntryResult } from '../../domain/entry-draft.types';
import { baseUnitNameOf, titleOf } from '../../domain/entry-draft';
import { useProductEntryModule } from '../../module';
import { BackButton } from './BackButton';
import { useBulkDraft } from '../hooks/use-bulk-draft';
import { EntryShell } from './EntryShell';
import { entryKeys } from '../hooks/entry-keys';
import { useEntryNav } from '../hooks/use-entry-nav';
import { createCostLabels } from './Review.constants';

export function Review({
  draft,
  save,
}: {
  draft: EntryDraft;
  save: (u: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;
}) {
  const t = useEntryTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = useEntryPresentation();

  const adding = useRef(false);
  const [addError, setAddError] = useState<unknown>();
  const bulk = useBulkDraft();
  const { commands } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();
  const preview = useAppQuery({
    queryKey: entryKeys(store.id).custom(
      'preview',
      draft.id,
      draft.stock,
      draft.pricing,
      draft.newItem,
      draft.localTitle,
    ),
    queryFn: () => commands.preview(store.id, draft),
  });
  const register = useFinalCommand<EntryDraft, EntryResult>({
    operationId: draft.operationId as OperationId,
    run: async (d, operationId) => {
      const r = await commands.register(store.id, d, operationId);
      return {
        ...r,
        title: titleOf(d),
        baseUnitName: baseUnitNameOf(d),
        catalogStatus: r.catalogItemCreated ? 'Private' : 'Public',
      };
    },
    invalidates: [['products', store.id], ['reports', store.id], entryKeys(store.id).custom('search')],
    onSuccess: async (result) => {
      await save((d) => ({ ...d, result }));
      go.step(draft.id, 'done', true);
    },
  });

  const p = preview.data;
  const failed = register.state.kind === 'failed' ? register.state.error : null;
  const sale = p?.salePriceAmount != null ? presentation.money(fromApiMoney(p.salePriceAmount)!) : null;
  const item = draft.newItem;

  return (
    <EntryShell
      title={t('review')}
      actions={
        <>
          <Button
            block
            loading={register.busy}
            disabled={!p || register.state.kind === 'succeeded'}
            onClick={() => {
              if (!draft.bulkHost) {
                void register.submit(draft);
                return;
              }
              if (adding.current) return;
              adding.current = true;
              void bulk
                .update((d) => {
                  if (d.pending || d.result) throw new Error('BULK_LOCKED');
                  if (d.rows.some((r) => r.clientRowId === draft.id)) return d;
                  if (d.rows.length >= 200) throw new Error('BULK_ROW_LIMIT');
                  const entry = {
                    ...draft,
                    stock: draft.stock
                      ? {
                          ...draft.stock,
                          ...d.sharedReceipt,
                          supplierInvoiceNo: d.sharedReceipt.supplierInvoiceNo ?? '',
                        }
                      : null,
                  };
                  return { ...d, lastScan: undefined, rows: [...d.rows, { clientRowId: draft.id, entry }] };
                })
                .then(() => go.nav.push('/s/' + store.id + '/entry/bulk'))
                .catch(setAddError)
                .finally(() => {
                  adding.current = false;
                });
            }}
          >
            {t('confirm')}
          </Button>
          <BackButton onClick={go.back} />
        </>
      }
    >
      {register.state.kind === 'unknown' ? (
        <PageState
          kind="unknown-result"
          action={
            <Button variant="secondary" onClick={() => void register.retry()}>
              {t('checkAgain')}
            </Button>
          }
        />
      ) : null}
      {addError ? <Alert tone="danger" title={t('startFailed')} /> : null}
      {failed ? <Alert title={t('submitFailed')} description={errorMessage(failed)} /> : null}
      {register.completionErrors.length ? (
        <Alert tone="warning" title={t('productSaved')} description={t('resultIncomplete')} />
      ) : null}
      {preview.error ? <Alert title={t('incomplete')} description={errorMessage(preview.error)} /> : null}
      {preview.isPending ? <PageState kind="loading" rows={3} /> : null}
      {p ? (
        <>
          <Section title={t('storeProduct')}>
            <ListRow>{p.title}</ListRow>
            <ListRow>
              {[
                item
                  ? t('typeNamed', { name: item.productTypeName })
                  : draft.catalog
                    ? t('typeNamed', { name: draft.catalog.typeName })
                    : null,
                item?.brandName
                  ? t('brandNamed', { name: item.brandName })
                  : draft.catalog?.brandName
                    ? t('brandNamed', { name: draft.catalog.brandName })
                    : null,
                t('unitNamed', { name: p.baseUnitName }),
              ]
                .filter(Boolean)
                .join(' · ')}
            </ListRow>
          </Section>
          <Section title={t('stockPrice')}>
            <ListRow>{p.conversionText ?? t('noStockHint')}</ListRow>
            {draft.stock ? (
              <ListRow>
                {t('initialCost')}
                {createCostLabels(t)[p.costStatus]}
                {p.costPerBaseAmount != null
                  ? t('costPer', {
                      unit: p.baseUnitName,
                      amount: presentation.money(fromApiMoney(p.costPerBaseAmount)!),
                    })
                  : ''}
              </ListRow>
            ) : null}
            <ListRow>
              {sale ? t('salePer', { unit: p.baseUnitName, amount: sale }) : t('priceNotSet')}
            </ListRow>
          </Section>
          <Alert
            tone="warning"
            title={t('beforeSubmit')}
            description={
              <ul className="flex list-disc flex-col gap-1 ps-4">
                {p.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
                {draft.source === 'new' ? <li>{t('privateBeforeReview')}</li> : null}
              </ul>
            }
          />
        </>
      ) : null}
    </EntryShell>
  );
}
