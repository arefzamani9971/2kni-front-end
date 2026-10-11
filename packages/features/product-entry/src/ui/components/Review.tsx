'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { useEffect, useRef, useState } from 'react';
import { useAppQuery, useFinalCommand } from '@dukani/data';
import { fromApiMoney, newOperationId, todayDateOnly, type OperationId } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, Checkbox, PageState } from '@dukani/ui-kit';
import type { EntryDraft, EntryResult } from '../../domain/entry-draft.types';
import { baseUnitNameOf, kindOf, titleOf, toRegisterRequest } from '../../domain/entry-draft';
import { useProductEntryModule } from '../../module';
import { BackButton } from './BackButton';
import { ReviewSummary } from './ReviewSummary';
import { addEntryToBulk } from '../../domain/bulk-draft';
import { useBulkDraft } from '../hooks/use-bulk-draft';
import { EntryReviewShell } from './EntryReviewShell';
import { entryKeys } from '../hooks/entry-keys';
import { useEntryNav } from '../hooks/use-entry-nav';

export function Review({
  draft,
  save,
}: {
  draft: EntryDraft;
  save: (u: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;
}) {
  const t = useEntryTranslations();
  const errorMessage = useAppErrorMessage();

  const adding = useRef(false);
  const submitting = useRef(false);
  const [addError, setAddError] = useState<unknown>();
  const [expiredConfirmed, setExpiredConfirmed] = useState(false);
  const expired = !!draft.stock?.expiryDate && draft.stock.expiryDate < todayDateOnly();
  const bulk = useBulkDraft(!!draft.bulkHost);
  const { commands, analytics } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();
  const preview = useAppQuery({
    queryKey: entryKeys(store.id).custom('preview', draft.id, toRegisterRequest(draft)),
    queryFn: () => commands.preview(store.id, draft),
  });
  const register = useFinalCommand<EntryDraft, EntryResult>({
    operationId: draft.operationId as OperationId,
    run: async (d, operationId) => {
      const started = performance.now();
      analytics.track({ eventName: 'submit_started', flowId: 'F10' });
      const r = await commands.registerRequest(
        store.id,
        d.pending?.body ?? toRegisterRequest(d),
        (d.pending?.operationId ?? operationId) as OperationId,
      );
      analytics.track({
        eventName: 'submit_result',
        flowId: 'F10',
        outcome: 'success',
        durationMs: performance.now() - started,
      });
      return {
        ...r,
        title: titleOf(d),
        baseUnitName: baseUnitNameOf(d),
      };
    },
    invalidates: [['products', store.id], ['reports', store.id], entryKeys(store.id).custom('search')],
    onSuccess: async (result) => {
      const saved = await save((d) => ({ ...d, result, pending: undefined }));
      if (!saved) throw new Error('DRAFT_SAVE_FAILED');
      go.step(draft.id, 'done', true);
    },
  });

  const p = preview.data;
  const failed = register.state.kind === 'failed' ? register.state.error : null;
  useEffect(() => {
    if (register.state.kind === 'failed')
      analytics.track({
        eventName: 'submit_result',
        flowId: 'F10',
        outcome: 'failed',
        errorCode: register.state.error.code,
      });
    else if (register.state.kind === 'unknown')
      analytics.track({ eventName: 'submit_result', flowId: 'F10', outcome: 'unknown' });
  }, [register.state, analytics]);
  useEffect(() => {
    if (failed && draft.pending) void save((d) => ({ ...d, pending: undefined })).catch(setAddError);
  }, [failed, draft.pending, save]);

  return (
    <EntryReviewShell
      draft={draft}
      salePrice={p?.salePriceAmount != null ? fromApiMoney(p.salePriceAmount) : null}
      onBack={go.back}
      locked={register.busy || !!draft.pending}
      title={t('review')}
      actions={
        <>
          <Button
            block
            loading={register.busy}
            disabled={
              !p ||
              (expired && !expiredConfirmed) ||
              !p.titleCheck.isAvailable ||
              register.state.kind === 'succeeded' ||
              register.state.kind === 'unknown' ||
              (!!draft.pending && register.state.kind === 'idle')
            }
            onClick={() => {
              if (!draft.bulkHost) {
                if (submitting.current) return;
                submitting.current = true;
                void (async () => {
                  const operationId = newOperationId();
                  const frozen = await save((d) => ({
                    ...d,
                    operationId,
                    pending: { operationId, body: toRegisterRequest(d) },
                  }));
                  if (frozen) await register.submit(frozen);
                })()
                  .catch(setAddError)
                  .finally(() => {
                    submitting.current = false;
                  });
                return;
              }
              if (adding.current) return;
              adding.current = true;
              void bulk
                .update((d) => addEntryToBulk(d, draft))
                .then(() => go.nav.push(sellerRoutes.entry.bulk(store.id)))
                .catch(setAddError)
                .finally(() => {
                  adding.current = false;
                });
            }}
          >
            {t('confirm')}
          </Button>
          <BackButton onClick={go.back} disabled={register.busy || !!draft.pending} />
        </>
      }
    >
      {register.state.kind === 'unknown' || (draft.pending && register.state.kind === 'idle') ? (
        <PageState
          kind="unknown-result"
          action={
            <Button
              variant="secondary"
              onClick={() => {
                analytics.track({ eventName: 'recovery_used', flowId: 'F10' });
                void (register.state.kind === 'idle' ? register.submit(draft) : register.retry());
              }}
            >
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
          {expired ? (
            <Checkbox checked={expiredConfirmed} onChange={setExpiredConfirmed} label={t('expiredConfirm')} />
          ) : null}
          <ReviewSummary draft={draft} preview={p} />
          <Alert
            tone="warning"
            title={t('beforeSubmit')}
            description={
              <ul className="flex list-disc flex-col gap-1 ps-4">
                {p.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
                {draft.source === 'new' && kindOf(draft) !== 'Service' ? (
                  <li>{t('privateBeforeReview')}</li>
                ) : null}
              </ul>
            }
          />
        </>
      ) : null}
    </EntryReviewShell>
  );
}
