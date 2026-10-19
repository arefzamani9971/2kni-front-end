'use client';
import { useAppQuery, useFinalCommand } from '@dukani/data';
import { newOperationId, type OperationId } from '@dukani/domain';
import { useActiveStore, useCan, useOnlineStatus } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { toBulkRequest, type BulkDraft } from '../../../domain/bulk-draft';
import type { BulkRequest } from '../../../domain/bulk-draft.types';
import { useProductEntryModule } from '../../../module';
import { useEntryNav } from '../../common/hooks/use-entry-nav';

/**
 * Bulk review and commit: a server preview of the frozen rows, then one all-or-none registration whose payload and
 * operation id are stored in the draft before sending, so an unknown result is recovered with the same request.
 */
export function useBulkCommit(options: {
  readonly draft: BulkDraft;
  readonly reviewing: boolean;
  readonly update: (transform: (draft: BulkDraft) => BulkDraft) => Promise<BulkDraft>;
  readonly onError: (error: unknown) => void;
}) {
  const { draft, update } = options;
  const store = useActiveStore();
  const can = useCan('product.manage');
  const online = useOnlineStatus();
  const go = useEntryNav();
  const { commands } = useProductEntryModule();
  const preview = useAppQuery({
    queryKey: ['entry-bulk-preview', store.id, toBulkRequest(draft)],
    enabled: options.reviewing && online && draft.rows.length > 0 && !draft.result,
    queryFn: () => commands.validateBulk(store.id, toBulkRequest(draft)),
  });
  const command = useFinalCommand<
    { body: BulkRequest; operationId: OperationId },
    Awaited<ReturnType<typeof commands.registerBulk>>
  >({
    operationId: draft.pending?.operationId,
    run: (intent) => commands.registerBulk(store.id, intent.body, intent.operationId),
    invalidates: [
      ['products', store.id],
      ['catalog', store.id],
      ['reports', store.id],
    ],
    onSuccess: async (result) => {
      await update((d) => ({ ...d, result }));
      go.nav.replace(sellerRoutes.entry.bulk(store.id, 'done'));
    },
  });
  const submit = async () => {
    if (!can || !online || command.busy || !preview.data || preview.data.errorCount || draft.result) return;
    try {
      const saved = await update((d) =>
        d.pending ? d : { ...d, pending: { operationId: newOperationId(), body: toBulkRequest(d) } },
      );
      if (saved.pending) await command.submit(saved.pending);
    } catch (error) {
      options.onError(error);
    }
  };
  const success = draft.result ?? (command.state.kind === 'succeeded' ? command.state.result : undefined);
  const unknown =
    command.state.kind === 'unknown' ||
    (!!draft.pending && !success && !command.busy && command.state.kind !== 'failed');
  return {
    preview,
    command,
    success,
    unknown,
    submit,
    recover: () => (draft.pending ? void command.submit(draft.pending) : undefined),
    /** After a definitive failure the frozen payload is released so the seller can correct the rows. */
    release: () => update((d) => ({ ...d, pending: undefined })),
  };
}
