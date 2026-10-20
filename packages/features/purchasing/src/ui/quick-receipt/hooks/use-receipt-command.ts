'use client';
import { useFinalCommand } from '@dukani/data';
import { newOperationId, type OperationId } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { useEffect, useRef, useState } from 'react';
import type { PendingReceipt, QuickReceipt, RecordedReceipt } from '../../../domain/receipt.types';
import { usePurchasingModule } from '../../../module';
import type { LocalDraftSave } from '../types/use-local-draft.types';
import type { ReceiptCommandOptions } from '../types/use-receipt-command.types';

/**
 * One idempotent receipt (`POST …/purchases/quick`) per user action. «ثبت» first freezes the receipt with a new
 * operation id in the draft, so a refresh or a lost answer replays the very same request; a definitive refusal
 * releases it; an unknown answer keeps the form frozen until «بررسی دوباره» settles it — never a blind resend.
 */
export function useReceiptCommand<D extends { readonly pending: PendingReceipt | null }>(
  draft: D | null,
  save: LocalDraftSave<D>,
  { freeze, release, onRecorded, invalidates = [] }: ReceiptCommandOptions<D>,
) {
  const { receipts } = usePurchasingModule();
  const store = useActiveStore();
  const freezing = useRef(false);
  const [draftError, setDraftError] = useState<unknown>(null);
  const command = useFinalCommand<PendingReceipt, RecordedReceipt>({
    operationId: (draft?.pending?.operationId ?? null) as OperationId | null,
    run: (pending) => receipts.record(store.id, pending.receipt, pending.operationId as OperationId),
    invalidates: [['products', store.id], ['purchases', store.id], ['reports', store.id], ...invalidates],
    onSuccess: (recorded, pending) => onRecorded(recorded, pending),
  });
  const failed = command.state.kind === 'failed' ? command.state.error : null;
  const frozen = !!draft?.pending;
  useEffect(() => {
    if (failed && frozen) void save(release).catch(setDraftError);
  }, [failed, frozen, save, release]);

  const submit = async (receipt: QuickReceipt) => {
    if (freezing.current || command.busy) return;
    freezing.current = true;
    setDraftError(null);
    // a refusal shown before is done with; clearing it first keeps it from releasing the new frozen receipt
    command.reset();
    try {
      const pending: PendingReceipt = { operationId: newOperationId(), receipt };
      const saved = await save((d) => freeze(d, pending));
      if (saved) await command.submit(pending);
    } catch (error) {
      setDraftError(error);
    } finally {
      freezing.current = false;
    }
  };
  const recover = () =>
    command.state.kind === 'idle' && draft?.pending ? command.submit(draft.pending) : command.retry();
  return {
    state: command.state,
    busy: command.busy,
    failed,
    completionErrors: command.completionErrors,
    /** Sent (or frozen before a refresh) without a known answer: only «بررسی دوباره» settles it. */
    unknown: command.state.kind === 'unknown' || (frozen && command.state.kind === 'idle'),
    draftError,
    submit,
    recover,
    reset: command.reset,
  };
}
