import { decimal, newUuid } from '@dukani/domain';
import { toRegisterRequest } from './entry-draft';
import type { BulkDraft, BulkRow, BulkRequest } from './bulk-draft.types';
export type { BulkDraft, BulkRow } from './bulk-draft.types';

/** A fresh multi-item entry: purchase receipt, no rows. */
export const emptyBulkDraft = (): BulkDraft => ({
  schemaVersion: 1,
  id: newUuid(),
  rows: [],
  sharedReceipt: { kind: 'Purchase', supplierId: null, supplierInvoiceNo: null, documentDate: null },
  updatedAt: new Date().toISOString(),
});

export function appendBulkRow(draft: BulkDraft, row: BulkRow): BulkDraft {
  if (draft.pending || draft.result) throw new Error('BULK_LOCKED');
  if (draft.rows.some((existing) => existing.clientRowId === row.clientRowId)) return draft;
  if (draft.rows.length >= 200) throw new Error('BULK_ROW_LIMIT');
  return { ...draft, rows: [...draft.rows, row], lastScan: undefined };
}
export function toBulkRequest(draft: BulkDraft): BulkRequest {
  return {
    sharedReceipt: draft.sharedReceipt,
    rows: draft.rows.map((row) => ({
      clientRowId: row.clientRowId,
      registration: toRegisterRequest({
        ...row.entry,
        stock: row.entry.stock
          ? {
              ...row.entry.stock,
              kind: draft.sharedReceipt.kind,
              supplierId: draft.sharedReceipt.supplierId ?? null,
              supplierInvoiceNo: draft.sharedReceipt.supplierInvoiceNo ?? '',
            }
          : null,
      }),
    })),
  };
}
/** Scan +1 merges only a previous scan mutation of the same unit, never arbitrary receipt lines. */
export function acceptBulkScan(draft: BulkDraft, row: BulkRow): BulkDraft {
  if (draft.pending || draft.result || !row.entry.stock) return draft;
  const prior = draft.lastScan && draft.rows.find((r) => r.clientRowId === draft.lastScan!.clientRowId);
  if (
    prior &&
    prior.entry.stock &&
    prior.entry.catalog?.id === row.entry.catalog?.id &&
    prior.entry.stock?.unitKey === row.entry.stock.unitKey
  ) {
    const next = {
      ...prior,
      entry: {
        ...prior.entry,
        stock: { ...prior.entry.stock, quantity: decimal.add(prior.entry.stock.quantity, decimal.of(1)) },
      },
    };
    return {
      ...draft,
      rows: draft.rows.map((r) => (r.clientRowId === prior.clientRowId ? next : r)),
      lastScan: { clientRowId: prior.clientRowId, before: prior },
    };
  }
  if (draft.rows.length >= 200) throw new Error('BULK_ROW_LIMIT');
  return { ...draft, rows: [...draft.rows, row], lastScan: { clientRowId: row.clientRowId, before: null } };
}
export function undoBulkScan(draft: BulkDraft): BulkDraft {
  const mutation = draft.lastScan;
  if (!mutation || draft.pending || draft.result) return draft;
  return {
    ...draft,
    lastScan: undefined,
    rows: mutation.before
      ? draft.rows.map((r) => (r.clientRowId === mutation.clientRowId ? mutation.before! : r))
      : draft.rows.filter((r) => r.clientRowId !== mutation.clientRowId),
  };
}
