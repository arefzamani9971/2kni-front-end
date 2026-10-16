import type { AttachmentDraft } from './catalog-attachment.types';

/** Join once by identity, rather than scanning two complete lists for every rendered row. */
export function attachmentSummary(draft: AttachmentDraft) {
  const selections = new Map(draft.selections.map((entry) => [entry.row.clientRowId, entry]));
  const results = new Map(
    draft.chunks.flatMap(
      (chunk) => chunk.result?.results.map((row) => [row.clientRowId, row] as const) ?? [],
    ),
  );
  const counts = { added: 0, existing: 0, failed: 0 };
  for (const result of results.values()) {
    if (result.status === 'Added') counts.added++;
    if (result.status === 'AlreadyExists') counts.existing++;
    if (result.status === 'Failed') counts.failed++;
  }
  const rows = draft.chunks.flatMap((chunk) =>
    chunk.preview.rows.map((row) => ({
      row,
      selection: selections.get(row.clientRowId),
      result: results.get(row.clientRowId),
    })),
  );
  return { rows, counts };
}
