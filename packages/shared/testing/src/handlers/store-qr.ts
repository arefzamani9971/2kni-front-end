import type { MockDb } from '../db/mock-db.types';
import { route } from '../msw/route';
import { fail } from '../msw/problem';

// Fixture ordering is shared across app origins; their localStorage databases are not.
function fixtureCode(index: number) {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let remaining = index;
  let code = '';
  for (let digit = 0; digit < 8; digit++) {
    code = alphabet[remaining % alphabet.length] + code;
    remaining = Math.floor(remaining / alphabet.length);
  }
  return code;
}

/** The default mock release has no customer membership rollout; QR still has a valid public destination. */
export const storeQrHandlers = (db: MockDb) => [
  route.get('/api/v1/stores/{storeId}/join-qr', ({ params, request }) => {
    db.requireMember(request, params.storeId, 'store.settings');
    const index = db.state.stores.findIndex((s) => s.id === params.storeId);
    const store = db.state.stores[index];
    if (!store) throw fail.notFound('فروشگاه');
    if (!store.joinCode)
      db.mutate(() => {
        store.joinCode = fixtureCode(index);
      });
    return {
      publicCode: store.joinCode!,
      joinUrl: `http://localhost:3002/join/${store.joinCode}`,
      displayName: store.name,
      address: store.address?.line ?? null,
      available: false,
    };
  }),
  route.get('/api/v1/store-join/{publicCode}', ({ params }) => {
    const store = db.state.stores.find(
      (s, index) => (s.joinCode ?? fixtureCode(index)) === params.publicCode,
    );
    if (!store) throw fail.notFound('فروشگاه');
    return {
      publicCode: params.publicCode,
      joinUrl: `http://localhost:3002/join/${params.publicCode}`,
      displayName: store.name,
      address: store.address?.line ?? null,
      available: false,
    };
  }),
];
