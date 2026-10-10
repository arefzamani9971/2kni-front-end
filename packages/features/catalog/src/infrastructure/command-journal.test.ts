import { createMemoryDraftStore } from '@dukani/platform';
import { newOperationId } from '@dukani/domain';
import { createCommandJournal } from './command-journal';
describe('catalog operation journal', () => {
  it('retains unsupported versions instead of silently creating another operation', async () => {
    const storage = createMemoryDraftStore();
    const key = { userId: 'u', storeId: 's', flow: 'catalog-command', id: 'type:h' };
    await storage.put(key, { schemaVersion: 2, operationId: newOperationId(), payload: { name: 'future' } });
    const journal = createCommandJournal(storage, () => 'u');
    await expect(journal.read('s', 'type:h')).rejects.toMatchObject({ code: 'DRAFT_SCHEMA_UNSUPPORTED' });
    expect((await storage.get(key))?.data).toMatchObject({ schemaVersion: 2 });
  });
  it('isolates payloads by user, store and host flow', async () => {
    const storage = createMemoryDraftStore();
    let user = 'a';
    const journal = createCommandJournal(storage, () => user);
    const intent = { schemaVersion: 1 as const, operationId: newOperationId(), payload: { name: 'private' } };
    await journal.write('store-a', 'brand:host-a', intent);
    expect(await journal.read('store-a', 'brand:host-a')).toEqual(intent);
    expect(await journal.read('store-b', 'brand:host-a')).toBeNull();
    expect(await journal.read('store-a', 'brand:host-b')).toBeNull();
    user = 'b';
    expect(await journal.read('store-a', 'brand:host-a')).toBeNull();
  });
});
