import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from './event-bus';
import { createMemoryDraftStore } from './drafts/draft-store';
import { createMemorySession } from './session/memory-session';
import { createMemoryStorage } from './storage/key-value-storage';

describe('platform', () => {
  it('event bus delivers typed events and unsubscribes', () => {
    const bus = createEventBus();
    const handler = vi.fn();
    const off = bus.on('product.created', handler);
    bus.emit('product.created', { storeId: 's', storeProductId: 'p', kind: 'Goods' });
    off();
    bus.emit('product.created', { storeId: 's', storeProductId: 'q', kind: 'Goods' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('drafts are isolated per store (BIZ-ACC-05)', async () => {
    const drafts = createMemoryDraftStore();
    await drafts.put({ storeId: 'a', userId: 'u', flow: 'sale', id: '1' }, { lines: 2 });
    expect(await drafts.list({ storeId: 'b', userId: 'u', flow: 'sale' })).toHaveLength(0);
    expect(await drafts.list({ storeId: 'a', userId: 'u', flow: 'sale' })).toHaveLength(1);
  });

  it('memory session signs in, restores and signs out', async () => {
    const storage = createMemoryStorage();
    const session = createMemorySession(storage);
    const user = { id: 'u', mobile: '09123456789', displayName: null, defaultStoreId: null, platformRoles: [] };
    await session.signIn({ accessToken: 't', accessTokenExpiresAt: '', user });
    const again = createMemorySession(storage);
    expect((await again.restore()).status).toBe('signed-in');
    expect(again.getAccessToken()).toBe('t');
    await again.signOut();
    expect(again.getState().status).toBe('signed-out');
  });
});
