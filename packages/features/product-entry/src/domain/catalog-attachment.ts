import { newOperationId } from '@dukani/domain';
import type { AttachmentCandidate, AttachmentDraft, AttachmentSelection } from './catalog-attachment.types';

export const emptyAttachmentDraft = (): AttachmentDraft => ({
  schemaVersion: 1,
  selections: [],
  chunks: [],
  stage: 'select',
});
/** Selection is an explicit identity snapshot. Re-selecting a page never replaces edits or row intent. */
export function selectAttachmentCandidates(
  current: AttachmentSelection[],
  candidates: readonly AttachmentCandidate[],
): AttachmentSelection[] {
  const selected = new Map(current.map((entry) => [entry.row.catalogItemId, entry]));
  for (const candidate of candidates) {
    const unit = candidate.units.find((entry) => entry.kind === 'Base') ?? candidate.units[0];
    if (!unit || selected.has(candidate.item.id)) continue;
    selected.set(candidate.item.id, {
      candidate,
      row: {
        clientRowId: newOperationId(),
        catalogItemId: candidate.item.id,
        catalogItemUnitId: unit.id,
        localBarcode: null,
      },
    });
  }
  return [...selected.values()];
}
export function attachmentGroups(selections: AttachmentSelection[]): AttachmentSelection[][] {
  return Array.from({ length: Math.ceil(selections.length / 100) }, (_, index) =>
    selections.slice(index * 100, (index + 1) * 100),
  );
}
export function retryFailedAttachments(draft: AttachmentDraft): AttachmentDraft {
  const failed = new Set(
    draft.chunks.flatMap(
      (chunk) =>
        chunk.result?.results.filter((row) => row.status === 'Failed').map((row) => row.clientRowId) ?? [],
    ),
  );
  return {
    ...emptyAttachmentDraft(),
    selections: draft.selections.filter((selection) => failed.has(selection.row.clientRowId)),
  };
}

/** Editing a partly completed batch cannot re-submit successful membership/alias rows. */
export function editAttachmentSelection(draft: AttachmentDraft): AttachmentDraft {
  const succeeded = new Set(
    draft.chunks.flatMap(
      (chunk) =>
        chunk.result?.results
          .filter((row) => row.status === 'Added' || row.status === 'AlreadyExists')
          .map((row) => row.clientRowId) ?? [],
    ),
  );
  return {
    ...emptyAttachmentDraft(),
    selections: draft.selections.filter((selection) => !succeeded.has(selection.row.clientRowId)),
  };
}
