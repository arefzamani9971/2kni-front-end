'use client';
import { useEffect, useRef, useState } from 'react';
import { useFinalCommand } from '@dukani/data';
import { newOperationId, type OperationId } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { baseUnitNameOf, titleOf, toRegisterRequest } from '../../../domain/entry-draft';
import type { EntryDraft, EntryResult } from '../../../domain/entry-draft.types';
import { timedSubmit } from '../../../application/submit-telemetry';
import { useProductEntryModule } from '../../../module';
import type { Save } from '../../common/types/use-entry-draft.types';
import { entryKeys } from '../../hooks/entry-keys';
import { useEntryNav } from '../../hooks/use-entry-nav';
import { useSubmitTelemetry } from './use-submit-telemetry';

/**
 * The idempotent register of a reviewed entry: «تأیید» first freezes the request and its operation id in the draft,
 * so a refresh or a lost response replays the very same register; the answer is saved in the draft before the done
 * step opens. A refusal releases the frozen request so the entry can be changed. A frozen request found on the way
 * in (a refresh during the register) is `unknown` until it is checked again.
 */
export function useEntryRegistration(draft: EntryDraft, save: Save) {
  const { commands, analytics } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();
  const freezing = useRef(false);
  const [draftError, setDraftError] = useState<unknown>();
  const command = useFinalCommand<EntryDraft, EntryResult>({
    operationId: draft.operationId as OperationId,
    run: timedSubmit(analytics, 'F10', async (d: EntryDraft, operationId: OperationId) => ({
      ...(await commands.registerRequest(
        store.id,
        d.pending?.body ?? toRegisterRequest(d),
        (d.pending?.operationId ?? operationId) as OperationId,
      )),
      title: titleOf(d),
      baseUnitName: baseUnitNameOf(d),
    })),
    // the catalog list shows «در فروشگاه من» from the same membership
    invalidates: [
      ['products', store.id],
      ['catalog', store.id],
      ['reports', store.id],
      entryKeys(store.id).custom('search'),
    ],
    onSuccess: async (result) => {
      const saved = await save((d) => ({ ...d, result, pending: undefined }));
      if (!saved) throw new Error('DRAFT_SAVE_FAILED');
      go.step(draft.id, 'done', true);
    },
  });
  const telemetry = useSubmitTelemetry('F10', command.state);
  const failed = command.state.kind === 'failed' ? command.state.error : null;
  useEffect(() => {
    if (failed && draft.pending) void save((d) => ({ ...d, pending: undefined })).catch(setDraftError);
  }, [failed, draft.pending, save]);

  const submit = async () => {
    if (freezing.current) return;
    freezing.current = true;
    try {
      const operationId = newOperationId();
      const frozen = await save((d) => ({
        ...d,
        operationId,
        pending: { operationId, body: toRegisterRequest(d) },
      }));
      if (frozen) await command.submit(frozen);
    } catch (error) {
      setDraftError(error);
    } finally {
      freezing.current = false;
    }
  };
  const recover = () => {
    telemetry.recoveryUsed();
    return command.state.kind === 'idle' ? command.submit(draft) : command.retry();
  };
  return {
    state: command.state,
    busy: command.busy,
    completionErrors: command.completionErrors,
    failed,
    /** Sent (or frozen before a refresh) without a known outcome: only «بررسی دوباره» settles it. */
    unknown: command.state.kind === 'unknown' || (!!draft.pending && command.state.kind === 'idle'),
    /** Freezing or releasing the request in the draft failed. */
    draftError,
    submit,
    recover,
  };
}
