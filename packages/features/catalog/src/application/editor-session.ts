import type { CatalogEditorStore } from './editor-store.types';
/** Serialize writes and removal for a single private editor session; no React or storage implementation dependency. */
export function createEditorSession(editors: CatalogEditorStore, storeId: string, id: string) {
  let queue: Promise<unknown> = Promise.resolve();
  const enqueue = (work: () => Promise<void>) => {
    const task = queue.then(work);
    queue = task.catch(() => undefined);
    return task;
  };
  return {
    write: <T>(value: T) => enqueue(() => editors.write(storeId, id, value)),
    remove: () => enqueue(() => editors.remove(storeId, id)),
  };
}
