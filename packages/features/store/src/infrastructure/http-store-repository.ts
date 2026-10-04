import type { Dto } from '@dukani/contracts';
import type { Api } from '@dukani/http';
import type { ActiveStore } from '@dukani/platform';
import type { StoreDetail, StoreRepository } from '../application/ports';

const toActive = (s: Dto<'StoreDto'>): ActiveStore => ({
  id: s.id,
  name: s.name,
  storeTypeKey: s.storeType.key,
  role: s.myRole,
  permissions: s.myPermissions,
});

const toDetail = (dto: Dto<'StoreDto'>): StoreDetail => ({ ...toActive(dto), profile: dto });

/** HTTP adapter: one method per endpoint, DTO → feature model mapping in one place. */
export const createHttpStoreRepository = (api: Api): StoreRepository => ({
  async myStores() {
    const dto = await api.get('/api/v1/stores', {});
    return {
      stores: dto.stores.map((s) => ({
        id: s.storeId,
        name: s.storeName,
        typeName: s.storeTypeName,
        role: s.role,
        isDefault: s.isDefault,
      })),
      invitations: dto.invitations.map((i) => ({
        id: i.invitationId,
        storeId: i.storeId,
        storeName: i.storeName,
        invitedBy: i.invitedByName ?? null,
        expiresAt: i.expiresAt,
      })),
      ownershipTransfers: dto.ownershipTransfers.map((t) => ({
        id: t.transferId,
        storeId: t.storeId,
        storeName: t.storeName,
        expiresAt: t.expiresAt,
      })),
      deactivatedStores: dto.deactivatedStores.map((d) => ({
        storeId: d.storeId,
        storeName: d.storeName,
        deactivatedAt: d.deactivatedAt ?? null,
        canReactivate: d.canReactivate,
      })),
    };
  },
  storeTypes: () => api.get('/api/v1/store-types', {}),
  async create(input, operationId) {
    const dto = await api.post('/api/v1/stores', {
      body: { name: input.name, storeTypeId: input.storeTypeId, businessMode: input.businessMode },
      operationId,
    });
    return toDetail(dto);
  },
  async get(storeId, signal) {
    return toDetail(await api.get('/api/v1/stores/{storeId}', { path: { storeId }, signal }));
  },
  async updateProfile(storeId, body) {
    return toDetail(await api.put('/api/v1/stores/{storeId}/profile', { path: { storeId }, body }));
  },
  async uploadLogo(storeId, file, expectedVersion) {
    const form = new FormData();
    form.append('File', file);
    form.append('ExpectedVersion', String(expectedVersion));
    return toDetail(await api.post('/api/v1/stores/{storeId}/logo', { path: { storeId }, form }));
  },
  previewTypeChange: (storeId, newStoreTypeId, signal) =>
    api.get('/api/v1/stores/{storeId}/type-change-preview', { path: { storeId }, query: { newStoreTypeId }, signal }),
  privateInfo: (storeId, signal) => api.get('/api/v1/stores/{storeId}/private-info', { path: { storeId }, signal }),
  updatePrivateInfo: (storeId, body) =>
    api.put('/api/v1/stores/{storeId}/private-info', { path: { storeId }, body }),
});
