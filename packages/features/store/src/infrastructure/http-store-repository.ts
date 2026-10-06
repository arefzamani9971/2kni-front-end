import type { Api } from '@dukani/http';
import type { StoreRepository } from '../application/ports';

import {
  storeDetailFromDto,
  storeTypeFromDto,
  profileUpdateToDto,
  privateInfoFromDto,
  privateInfoToDto,
  typeChangePreviewFromDto,
} from './store-mappers';

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
  storeTypes: async () => (await api.get('/api/v1/store-types', {})).map(storeTypeFromDto),
  async create(input, operationId) {
    const dto = await api.post('/api/v1/stores', {
      body: { name: input.name, storeTypeId: input.storeTypeId, businessMode: input.businessMode },
      operationId,
    });
    return storeDetailFromDto(dto);
  },
  async get(storeId, signal) {
    return storeDetailFromDto(await api.get('/api/v1/stores/{storeId}', { path: { storeId }, signal }));
  },
  async updateProfile(storeId, body) {
    return storeDetailFromDto(
      await api.put('/api/v1/stores/{storeId}/profile', {
        path: { storeId },
        body: profileUpdateToDto(body),
      }),
    );
  },
  async uploadLogo(storeId, file, expectedVersion) {
    const form = new FormData();
    form.append('File', file);
    form.append('ExpectedVersion', String(expectedVersion));
    return storeDetailFromDto(await api.post('/api/v1/stores/{storeId}/logo', { path: { storeId }, form }));
  },
  previewTypeChange: async (storeId, newStoreTypeId, signal) =>
    typeChangePreviewFromDto(
      await api.get('/api/v1/stores/{storeId}/type-change-preview', {
        path: { storeId },
        query: { newStoreTypeId },
        signal,
      }),
    ),
  privateInfo: async (storeId, signal) =>
    privateInfoFromDto(await api.get('/api/v1/stores/{storeId}/private-info', { path: { storeId }, signal })),
  updatePrivateInfo: async (storeId, body) =>
    privateInfoFromDto(
      await api.put('/api/v1/stores/{storeId}/private-info', {
        path: { storeId },
        body: privateInfoToDto(body),
      }),
    ),
});
