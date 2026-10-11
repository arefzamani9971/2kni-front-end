import { expect, it } from 'vitest';
import { createMemoryDraftStore } from '@dukani/platform';
import { createShortcutDrafts } from './shortcut-draft-store';
import type { ShortcutDraft } from '../domain/shortcut.types';
it('preserves a frozen pending replacement and rejects future schemas without overwriting', async () => {
  const storage = createMemoryDraftStore();
  let actor = 'alice';
  const repository = createShortcutDrafts(storage, () => actor);
  const pending = { version: 'v1', items: [] };
  const value: ShortcutDraft = {
    schemaVersion: 1,
    ...pending,
    code: 'incomplete',
    productId: '',
    query: '',
    pending,
  };
  const saving = repository.write('store', value);
  expect(await repository.read('store')).toEqual(value);
  await saving;
  actor = 'bob';
  expect(await repository.read('store')).toBeNull();
  actor = 'alice';
  const key = { storeId: 'store', userId: actor, flow: 'product-shortcuts', id: 'current' };
  await storage.put(key, { ...value, schemaVersion: 2 });
  await expect(repository.read('store')).rejects.toThrow('UNSUPPORTED_DRAFT_SCHEMA');
  expect((await storage.get<{ schemaVersion: number }>(key))?.data.schemaVersion).toBe(2);
});
