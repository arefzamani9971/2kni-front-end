import type { Dto } from '@dukani/contracts';
import { useFinalCommand } from '@dukani/data';
import { decimal, isAppError, type AppError } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { useRef, useState } from 'react';
import { toUpdateBody } from '../../domain/purchase';
import { usePurchasingModule } from '../../module';
import type { TotalsIntent } from '../types/purchase-totals.types';
import { purchaseKeys } from './purchase-keys';

/** Owns the whole save → returned version → finalize transaction, including its synchronous lock. */
export function useFinalizePurchase(
  purchase: Dto<'PurchaseDto'>,
  onSuccess: (result: Dto<'PurchaseDto'>) => void,
) {
  const store = useActiveStore();
  const { purchases } = usePurchasingModule();
  // Never silently rebase a dirty form onto a concurrently fetched draft.
  const saved = useRef(purchase);
  const [version, setVersion] = useState(purchase.version);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<AppError | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const submitted = useRef(false);
  const confirmed = useRef(false);
  const command = useFinalCommand<
    { version: number; confirm: boolean; reason: string | null },
    Dto<'PurchaseDto'>
  >({
    run: (intent, operationId) =>
      purchases.finalize(
        store.id,
        purchase.id,
        {
          expectedVersion: intent.version,
          confirmDuplicateInvoiceNo: intent.confirm,
          duplicateReason: intent.reason,
        },
        operationId,
      ),
    invalidates: [
      purchaseKeys(store.id).all,
      ['products', store.id],
      ['catalog', store.id],
      ['reports', store.id],
    ],
    onSuccess: (result) => {
      confirmed.current = true;
      onSuccess(result);
    },
  });

  const submit = (intent: TotalsIntent): Promise<void> => {
    if (inFlight.current) return inFlight.current;
    if (submitted.current || confirmed.current) return Promise.resolve();
    setSaveError(null);
    const execute = async () => {
      const current = saved.current;
      const dirty = Object.entries(intent.amounts).some(
        ([key, value]) =>
          !decimal.eq(decimal.of(value), decimal.of(current[key as keyof TotalsIntent['amounts']])),
      );
      if (dirty) {
        setSaving(true);
        try {
          // No cache/invalidation/navigation in this try: a successful save owns its new version.
          saved.current = await purchases.updateDraft(
            store.id,
            current.id,
            toUpdateBody(current, intent.amounts),
          );
          setVersion(saved.current.version);
        } catch (error) {
          setSaveError(
            isAppError(error) ? error : { kind: 'Bug', code: 'UNEXPECTED', message: String(error) },
          );
          return;
        } finally {
          setSaving(false);
        }
      }
      submitted.current = true;
      const result = await command.submit({
        version: saved.current.version,
        confirm: intent.confirm,
        reason: intent.reason,
      });
      if (result) confirmed.current = true;
    };
    const promise = execute().finally(() => {
      inFlight.current = null;
    });
    inFlight.current = promise;
    return promise;
  };
  // Only a definitive rejection allows a new intent. Unknown keeps the original operation/body.
  const resubmit = (intent: TotalsIntent) => {
    if (command.state.kind === 'failed' && !inFlight.current) submitted.current = false;
    return submit(intent);
  };
  return {
    state: command.state,
    completionErrors: command.completionErrors,
    retry: command.retry,
    submit: resubmit,
    saveError,
    version,
    busy: saving || command.busy,
    locked: saving || command.busy || command.state.kind === 'unknown' || command.state.kind === 'succeeded',
  };
}
