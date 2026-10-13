import type { Api } from '@dukani/http';
import type { MembershipsRepository } from '../application/ports';

export const createHttpMembershipsRepository = (api: Api): MembershipsRepository => ({
  async resolve(code, signal) {
    const dto = await api.get('/api/v1/store-join/{publicCode}', {
      path: { publicCode: code },
      signal,
      auth: false,
    });
    return {
      publicCode: dto.publicCode,
      displayName: dto.displayName,
      address: dto.address ?? null,
      available: dto.available,
    };
  },
  status: (code, signal) =>
    api.get('/api/v1/customer/memberships/by-code/{publicCode}', { path: { publicCode: code }, signal }),
  async join(code) {
    const dto = await api.post('/api/v1/customer/memberships', {
      body: { publicCode: code, storeId: null, source: 'Qr' },
    });
    return { storeId: dto.storeId, isMember: true };
  },
  async grantMarketing(storeId) {
    await api.put('/api/v1/customer/marketing-consents/{storeId}', {
      path: { storeId },
      body: { granted: true },
    });
  },
});
