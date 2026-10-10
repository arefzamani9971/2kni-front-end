import { createEditorSession } from '../application/editor-session';
import type { CatalogEditorStore } from '../application/editor-store.types';
import { createMemoryDraftStore } from '@dukani/platform';
import { createEditorStore } from './editor-store';
it('serializes edits and removal so slow earlier writes cannot overwrite the latest input', async () => {
  let release!: () => void;
  const storage = createEditorStore(createMemoryDraftStore(), () => 'user');
  const events: string[] = [];
  const editor: CatalogEditorStore = {
    ...storage,
    async write(storeId, id, value) {
      events.push(String(value));
      if (value === 'first')
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      await storage.write(storeId, id, value);
    },
  };
  const session = createEditorSession(editor, 'store', 'brand:host');
  const first = session.write('first');
  await Promise.resolve();
  const second = session.write('latest');
  expect(events).toEqual(['first']);
  release();
  await first;
  await second;
  expect(await storage.read('store', 'brand:host')).toBe('latest');
  await session.remove();
  expect(await storage.read('store', 'brand:host')).toBeNull();
});
