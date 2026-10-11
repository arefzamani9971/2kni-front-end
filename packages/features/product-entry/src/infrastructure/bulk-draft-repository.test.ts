import { describe, expect, it } from 'vitest';
import { createMemoryDraftStore } from '@dukani/platform';
import { createBulkDrafts } from './bulk-draft-repository';
import type { BulkDraft } from '../domain/bulk-draft';
const empty = (): BulkDraft => ({
  schemaVersion: 1,
  id: 'draft',
  rows: [],
  sharedReceipt: { kind: 'Purchase' },
  updatedAt: '',
});
describe('bulk draft scope and writes', () => {
  it('isolates actors and stores', async () => {
    let actor = 'a';
    const repo = createBulkDrafts(createMemoryDraftStore(), () => actor);
    await repo.update('one', () => empty());
    expect(await repo.get('two')).toBeNull();
    actor = 'b';
    expect(await repo.get('one')).toBeNull();
    actor = 'a';
    expect((await repo.get('one'))?.id).toBe('draft');
  });
  it('serializes edits without losing the earlier change', async () => {
    const repo = createBulkDrafts(createMemoryDraftStore(), () => 'a');
    await repo.update('one', () => empty());
    await Promise.all([
      repo.update('one', (d) => ({ ...d!, sharedReceipt: { ...d!.sharedReceipt, supplierInvoiceNo: 'A' } })),
      repo.update('one', (d) => ({ ...d!, scanMode: 'ScanThenQuantity' })),
    ]);
    const saved = await repo.get('one');
    expect(saved?.sharedReceipt.supplierInvoiceNo).toBe('A');
    expect(saved?.scanMode).toBe('ScanThenQuantity');
  });
  it('rejects an unknown schema without overwriting it', async () => {
    const store = createMemoryDraftStore();
    await store.put({ storeId: 'one', userId: 'a', flow: 'entry-bulk', id: 'current' }, { schemaVersion: 2 });
    const repo = createBulkDrafts(store, () => 'a');
    await expect(repo.update('one', () => empty())).rejects.toThrow('DRAFT_SCHEMA_UNSUPPORTED');
  });
});
