import { describe, expect, it } from 'vitest';
import type { DraftStore } from '@dukani/platform';
import { createCorrectionDraftStore } from './correction-draft-store';
import type { CorrectionDraft } from '../domain/correction-draft.types';

describe('correction draft persistence', () => {
  it('waits for pending writes and captures the actor before queuing', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const rows = new Map<string, unknown>();
    const key = (scope: { userId: string; id: string }) => scope.userId + ':' + scope.id;
    const drafts = {
      put: async (scope: { userId: string; id: string }, data: unknown) => {
        await gate;
        rows.set(key(scope), { data });
      },
      get: async (scope: { userId: string; id: string }) => rows.get(key(scope)) ?? null,
    } as unknown as DraftStore;
    let actor = 'alice';
    const repository = createCorrectionDraftStore(drafts, () => actor);
    const value: CorrectionDraft = { reason: 'unfinished', field: 'title', value: '', evidenceFileIds: [] };
    const write = repository.write('store', 'item', value);
    const read = repository.read('store', 'item');
    actor = 'bob';
    release();
    await write;
    expect(await read).toEqual(value);
    expect(await repository.read('store', 'item')).toBeNull();
  });
  it('preserves unsupported schema instead of resetting to an empty form', async () => {
    const stored = { data: { schemaVersion: 2, value: { reason: 'keep' } } };
    const drafts = { get: async () => stored } as unknown as DraftStore;
    await expect(createCorrectionDraftStore(drafts, () => 'actor').read('store', 'item')).rejects.toThrow(
      'UNSUPPORTED_DRAFT_SCHEMA',
    );
    expect(stored.data.value.reason).toBe('keep');
  });
});
