import { describe, expect, it } from 'vitest';
import { createMemoryDraftStore } from '@dukani/platform';
import { createEditorStore } from './editor-store';

describe('catalog unfinished form drafts', () => {
  it('isolates user, store and host draft while preserving raw invalid fields', async () => {
    const storage = createMemoryDraftStore();
    let user = 'first';
    const editors = createEditorStore(storage, () => user);
    const raw = { name: ' ', quantity: '-', categories: ['one'], images: ['private-image'] };
    await editors.write('store', 'type:host', raw);
    expect(await editors.read('store', 'type:host')).toEqual(raw);
    expect(await editors.read('other-store', 'type:host')).toBeNull();
    expect(await editors.read('store', 'type:other')).toBeNull();
    user = 'second';
    expect(await editors.read('store', 'type:host')).toBeNull();
    user = 'first';
    await editors.remove('store', 'type:host');
    expect(await editors.read('store', 'type:host')).toBeNull();
  });
  it('does not silently discard an unsupported future draft version', async () => {
    const storage = createMemoryDraftStore();
    await storage.put(
      { userId: 'user', storeId: 'store', id: 'type:host', flow: 'catalog-editor' },
      { schemaVersion: 2, value: { name: 'keep' } },
    );
    const editors = createEditorStore(storage, () => 'user');
    await expect(editors.read('store', 'type:host')).rejects.toMatchObject({
      code: 'DRAFT_SCHEMA_UNSUPPORTED',
    });
  });
});
