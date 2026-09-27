import type { Dto } from '@dukani/contracts';
import type { Api } from '@dukani/http';
import type { ActiveStore } from '@dukani/platform';
import type { StoreRepository } from '../application/ports';

const toActive = (s: Dto<'StoreDto'>): ActiveStore => ({
  id: s.id,
  name: s.name,
  storeTypeKey: s.storeType.key,
  role: s.myRole,
  permissions: s.myPermissions,
});

/** HTTP adapter: one method per endpoint, DTO → feature model mapping in one place. */
export const createHttpStoreRepository = (api: Api): StoreRepository => ({
  async myStores() {
    const dto = await api.get('/api/v1/stores', {});
    return {
      stores: dto.stores.map((s) => ({ id: s.storeId, name: s.storeName, typeName: s.storeTypeName, role: s.role, isDefault: s.isDefault })),
      invitations: dto.invitations.map((i) => ({ id: i.invitationId, storeId: i.storeId, storeName: i.storeName, invitedBy: i.invitedByName ?? null })),
    };
  },
  storeTypes: () => api.get('/api/v1/store-types', {}),
  async create(input, operationId) {
    const dto = await api.post('/api/v1/stores', {
      body: { name: input.name, storeTypeId: input.storeTypeId, businessMode: input.businessMode },
      operationId,
    });
    return toActive(dto);
  },
  async get(storeId, signal) {
    const dto = await api.get('/api/v1/stores/{storeId}', { path: { storeId }, signal });
    return { ...toActive(dto), profile: dto };
  },
});
