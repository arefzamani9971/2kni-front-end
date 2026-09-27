import { PERMISSION_TITLES, PERMISSIONS, STAFF_DEFAULT_PERMISSIONS } from '@dukani/domain';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db';
import { storeTypes } from '../db/reference';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { toStoreDto } from './dto';

/** Stores module: my stores, create store (ST02), store profile, permission list. */
export const storeHandlers = (db: MockDb) => [
  route.get('/api/v1/stores', ({ request }) => {
    const user = db.requireUser(request);
    return {
      stores: db.state.members
        .filter((m) => m.userId === user.id)
        .map((m) => {
          const s = db.state.stores.find((x) => x.id === m.storeId)!;
          return {
            storeId: s.id,
            storeName: s.name,
            storeTypeName: storeTypes.find((t) => t.id === s.storeTypeId)?.name ?? '—',
            role: m.role,
            isDefault: user.defaultStoreId === s.id,
            logoFileId: null,
          };
        }),
      invitations: [],
      ownershipTransfers: [],
    };
  }),

  route.post('/api/v1/stores', ({ request, body, idempotencyKey }) => {
    const user = db.requireUser(request);
    const name = body.name?.trim() ?? '';
    if (!name) throw fail.validation('name', 'نام فروشگاه را وارد کنید.', 'STORE_NAME_REQUIRED');
    if (name.length > 80) throw fail.validation('name', 'نام فروشگاه حداکثر ۸۰ نویسه است.');
    if (!storeTypes.some((t) => t.id === body.storeTypeId))
      throw fail.validation('storeTypeId', 'نوع فروشگاه را انتخاب کنید.', 'STORE_TYPE_INVALID');
    return db.mutate((s) => {
      const store = {
        id: randomId(),
        name,
        storeTypeId: body.storeTypeId,
        businessMode: body.businessMode ?? null,
        phone: null,
        email: null,
        timeZoneId: 'Asia/Tehran',
        createdAt: new Date().toISOString(),
      };
      const member = { storeId: store.id, userId: user.id, role: 'Owner' as const, permissions: [] };
      s.stores.push(store);
      s.members.push(member);
      if (!user.defaultStoreId) user.defaultStoreId = store.id;
      db.recordOperation(idempotencyKey, 'CreateStore', 'Store', store.id);
      return toStoreDto(db, store, member);
    });
  }),

  route.get('/api/v1/store-types', () => storeTypes),

  route.get('/api/v1/stores/{storeId}', ({ request, params }) => {
    const { member } = db.requireMember(request, params.storeId);
    return toStoreDto(db, db.state.stores.find((s) => s.id === params.storeId)!, member);
  }),

  route.get('/api/v1/permissions', () =>
    PERMISSIONS.map((key) => ({ key, title: PERMISSION_TITLES[key], isStaffDefault: STAFF_DEFAULT_PERMISSIONS.includes(key) })),
  ),

  route.get('/api/v1/stores/{storeId}/operations/{operationId}', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    const op = db.state.operations.find((o) => o.operationId === params.operationId);
    if (!op) throw fail.notFound('عملیات');
    return op;
  }),
];
