import { describe, expect, it, vi } from 'vitest';
import { appError, newOperationId } from '@dukani/domain';
import {
  attachmentGroups,
  emptyAttachmentDraft,
  retryFailedAttachments,
  selectAttachmentCandidates,
} from '../domain/catalog-attachment';
import type { AttachmentCandidate, AttachmentDraft } from '../domain/catalog-attachment.types';
import type { CatalogAttachments } from './catalog-attachment.ports';
import { previewAttachments, submitAttachments } from './catalog-attachment-workflow';

const candidate = (id: string): AttachmentCandidate => ({
  item: { id, title: id, productTypeId: 'type', productTypeName: 'type' },
  units: [{ id: id + '-unit', name: 'piece', kind: 'Base', barcodes: [] }],
});
const draft = (): AttachmentDraft => ({
  ...emptyAttachmentDraft(),
  selections: selectAttachmentCandidates([], [candidate('one'), candidate('two')]),
});
const api = (): CatalogAttachments => ({
  search: vi.fn(),
  snapshot: vi.fn(),
  recover: vi.fn().mockRejectedValue(appError('NotFound', 'NOT_FOUND', 'missing')),
  preview: vi.fn().mockImplementation(async (store, rows) => ({
    rows: rows.map((row: { clientRowId: string }) => ({
      clientRowId: row.clientRowId,
      title: 'product',
      unitName: 'piece',
      originalBarcodes: [],
    })),
    previewToken: 'bound',
    expiresAt: '2099-01-01T00:00:00Z',
  })),
  commit: vi.fn().mockImplementation(async (store, operationId, body) => ({
    operationId,
    state: 'Completed',
    results: body.rows.map((row: { clientRowId: string }) => ({
      clientRowId: row.clientRowId,
      status: 'Added',
      storeProductId: 'product',
    })),
  })),
});

describe('catalog attachment selection and durable workflow', () => {
  it('requires a fresh confirmation after an expired preview with no server ledger', async () => {
    const port = api();
    const approved = await previewAttachments(port, 'store', draft());
    let saved = approved;
    vi.mocked(port.commit).mockRejectedValue(appError('Conflict', 'VERSION_CONFLICT', 'expired'));
    await submitAttachments(port, 'store', approved, async (next) => {
      saved = next;
    });
    expect(saved.stage).toBe('review');
    expect(saved.chunks[0]!.operationId).not.toBe(approved.chunks[0]!.operationId);
    expect(saved.chunks[0]!.body.rows).toEqual(approved.chunks[0]!.body.rows);
    expect(port.commit).toHaveBeenCalledTimes(1);
  });
  it('preserves edited unit, barcode and row identity when pages overlap', () => {
    const initial = draft().selections;
    initial[0]!.row.localBarcode = 'LOCAL-01';
    initial[0]!.row.catalogItemUnitId = 'pack';
    const selected = selectAttachmentCandidates(initial, [
      candidate('two'),
      candidate('three'),
      candidate('one'),
    ]);
    expect(selected).toHaveLength(3);
    expect(selected[0]).toEqual(initial[0]);
    expect(new Set(selected.map((row) => row.row.clientRowId)).size).toBe(3);
  });
  it('splits explicit selection into bounded chunks without omission', () => {
    const selected = selectAttachmentCandidates(
      [],
      Array.from({ length: 201 }, (_, i) => candidate(String(i))),
    );
    const groups = attachmentGroups(selected);
    expect(groups.map((group) => group.length)).toEqual([100, 100, 1]);
    expect(groups.flat()).toEqual(selected);
  });
  it('persists frozen intent before transport and recovers unknown results without a second commit', async () => {
    const port = api();
    const approved = await previewAttachments(port, 'store', draft());
    let saved = approved;
    const save = vi.fn(async (next: AttachmentDraft) => {
      saved = structuredClone(next);
    });
    vi.mocked(port.commit).mockImplementationOnce(async () => {
      expect(saved.stage).toBe('pending');
      expect(saved.chunks[0]!.body).toEqual(approved.chunks[0]!.body);
      throw appError('Unknown', 'TIMEOUT', 'timeout');
    });
    await expect(submitAttachments(port, 'store', approved, save)).rejects.toMatchObject({ code: 'TIMEOUT' });
    const chunk = approved.chunks[0]!;
    vi.mocked(port.recover).mockResolvedValue({
      operationId: chunk.operationId,
      state: 'Completed',
      results: [
        { clientRowId: chunk.body.rows[0]!.clientRowId, status: 'Added' },
        { clientRowId: chunk.body.rows[1]!.clientRowId, status: 'Failed', errorCode: 'BARCODE_DUPLICATE' },
      ],
    });
    await submitAttachments(port, 'store', saved, save);
    expect(port.commit).toHaveBeenCalledTimes(1);
    expect(saved.stage).toBe('result');
    expect(retryFailedAttachments(saved).selections.map((row) => row.candidate.item.id)).toEqual(['two']);
  });
  it('resumes pending with the same operation and body, never on lookup failure', async () => {
    const port = api();
    const approved = await previewAttachments(port, 'store', draft());
    vi.mocked(port.recover).mockResolvedValue({
      operationId: newOperationId(),
      state: 'Pending',
      results: [],
    });
    await submitAttachments(port, 'store', approved, async () => undefined);
    expect(port.commit).toHaveBeenCalledWith(
      'store',
      approved.chunks[0]!.operationId,
      approved.chunks[0]!.body,
    );
    vi.mocked(port.commit).mockClear();
    vi.mocked(port.recover).mockRejectedValue(appError('Permission', 'PERMISSION_DENIED', 'denied'));
    await expect(submitAttachments(port, 'store', approved, async () => undefined)).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    });
    expect(port.commit).not.toHaveBeenCalled();
  });
});
