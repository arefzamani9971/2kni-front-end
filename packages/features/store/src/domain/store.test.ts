import { entryStoreId, type MyStores } from './store';

const item = (id: string) => ({ id, name: id, typeName: 't', role: 'Owner' as const, isDefault: false });

describe('entryStoreId', () => {
  it('prefers the default store, then the only store', () => {
    const my: MyStores = { stores: [item('a'), item('b')], invitations: [] };
    expect(entryStoreId(my, 'b')).toBe('b');
    expect(entryStoreId(my, null)).toBeNull();
    expect(entryStoreId({ stores: [item('a')], invitations: [] }, null)).toBe('a');
    expect(entryStoreId({ stores: [item('a')], invitations: [] }, 'gone')).toBe('a');
  });
});
