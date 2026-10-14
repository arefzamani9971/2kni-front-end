import { isAppError, newOperationId } from '@dukani/domain';
import type { CatalogAttachments } from './catalog-attachment.ports';
import { attachmentGroups } from '../domain/catalog-attachment';
import type { AttachmentDraft } from '../domain/catalog-attachment.types';

export async function previewAttachments(
  api: CatalogAttachments,
  storeId: string,
  draft: AttachmentDraft,
): Promise<AttachmentDraft> {
  const chunks = [];
  for (const group of attachmentGroups(draft.selections)) {
    const rows = group.map((selection) => selection.row);
    const preview = await api.preview(storeId, rows);
    chunks.push({
      operationId: newOperationId(),
      body: { rows, previewToken: preview.previewToken },
      preview,
    });
  }
  return { ...draft, chunks, stage: 'review' };
}

/** Persist the frozen requests before sending; only a confirmed NOT_FOUND permits starting the same intent again. */
export async function submitAttachments(
  api: CatalogAttachments,
  storeId: string,
  draft: AttachmentDraft,
  save: (next: AttachmentDraft) => Promise<unknown>,
): Promise<void> {
  let current: AttachmentDraft = { ...draft, stage: 'pending' };
  await save(current);
  for (let index = 0; index < current.chunks.length; index++) {
    const chunk = current.chunks[index]!;
    if (chunk.result?.state === 'Completed') continue;
    let result;
    try {
      result = await api.recover(storeId, chunk.operationId);
    } catch (error) {
      if (!isAppError(error) || error.code !== 'NOT_FOUND') throw error;
    }
    if (result?.state !== 'Completed') {
      try {
        result = await api.commit(storeId, chunk.operationId, chunk.body);
      } catch (error) {
        // A rejected new preview has no ledger. Re-preview explicitly, preserving completed chunks.
        // A transport failure or existing Pending ledger must keep the original frozen intent.
        if (result || !isAppError(error) || error.code !== 'VERSION_CONFLICT') throw error;
        try {
          await api.recover(storeId, chunk.operationId);
          throw error;
        } catch (lookup) {
          if (!isAppError(lookup) || lookup.code !== 'NOT_FOUND') throw lookup;
        }
        const preview = await api.preview(storeId, chunk.body.rows);
        await save({
          ...current,
          stage: 'review',
          chunks: current.chunks.map((entry, i) =>
            i === index
              ? {
                  operationId: newOperationId(),
                  preview,
                  body: { rows: chunk.body.rows, previewToken: preview.previewToken },
                }
              : entry,
          ),
        });
        return;
      }
    }
    current = {
      ...current,
      chunks: current.chunks.map((entry, i) => (i === index ? { ...entry, result } : entry)),
    };
    await save(current);
    if (result.state !== 'Completed') return;
  }
  await save({ ...current, stage: 'result' });
}
