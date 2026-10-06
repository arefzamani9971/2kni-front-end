import { entryStoreId } from './store';
import { closedOverlap, hasPublicInfo, isOvernight, toOpeningHours, buildProfileUpdate } from './store-draft';
import { EMPTY_STORE_DRAFT } from './store-draft.constants';
import type { MyStores } from './store.types';

const item = (id: string) => ({ id, name: id, typeName: 't', role: 'Owner' as const, isDefault: false });
const my = (stores: MyStores['stores']): MyStores => ({
  stores,
  invitations: [],
  ownershipTransfers: [],
  deactivatedStores: [],
});

describe('entryStoreId', () => {
  it('prefers the default store, then the only store', () => {
    expect(entryStoreId(my([item('a'), item('b')]), 'b')).toBe('b');
    expect(entryStoreId(my([item('a'), item('b')]), null)).toBeNull();
    expect(entryStoreId(my([item('a')]), null)).toBe('a');
    expect(entryStoreId(my([item('a')]), 'gone')).toBe('a');
  });

  it('never enters a store that is only invited, transferred or deactivated (F02-S18/S19)', () => {
    const pending: MyStores = {
      stores: [],
      invitations: [
        { id: 'i', storeId: 'x', storeName: 'x', invitedBy: null, expiresAt: '2026-01-01T00:00:00Z' },
      ],
      ownershipTransfers: [{ id: 't', storeId: 'y', storeName: 'y', expiresAt: '2026-01-01T00:00:00Z' }],
      deactivatedStores: [{ storeId: 'z', storeName: 'z', deactivatedAt: null, canReactivate: true }],
    };
    expect(entryStoreId(pending, 'z')).toBeNull();
  });
});

describe('store draft', () => {
  const store = {
    id: 's',
    name: 'آفتاب',
    storeType: { id: 'type', key: 'stationery', name: 'لوازم‌التحریر' },
    businessMode: 'Retail' as const,
    phone: '02188880000',
    email: null,
    address: {
      province: 'تهران',
      city: 'تهران',
      line: null,
      postalCode: null,
      latitude: null,
      longitude: null,
    },
    openingHours: [],
    logoFileId: 'logo',
    logoUrl: null,
    timeZoneId: 'Asia/Tehran',
    myRole: 'Owner' as const,
    myPermissions: [],
    completion: { hasContact: true, hasAddress: true, hasHours: false, hasPrivateInfo: false },
    version: 7,
  };

  it('only name/type is not «public info»; skipping sends nothing (F02-S05)', () => {
    expect(hasPublicInfo({ ...EMPTY_STORE_DRAFT, name: 'a', storeTypeId: 't' })).toBe(false);
    expect(hasPublicInfo({ ...EMPTY_STORE_DRAFT, location: { lat: 0, lng: 0 } })).toBe(true);
  });

  it('profile PUT is a full replace that keeps every value it does not change (F02 §9)', () => {
    const body = buildProfileUpdate(store, {
      ...EMPTY_STORE_DRAFT,
      contact: {
        phone: null,
        email: 'shop@example.com',
        addressLine: 'خیابان آزادی',
        postalCode: '0012345678',
      },
      location: { lat: 0, lng: 0 },
    });
    expect(body).toMatchObject({
      name: 'آفتاب',
      storeTypeId: 'type',
      businessMode: 'Retail',
      phone: '02188880000',
      email: 'shop@example.com',
      logoFileId: 'logo',
      version: 7,
      address: {
        province: 'تهران',
        city: 'تهران',
        line: 'خیابان آزادی',
        postalCode: '0012345678',
        latitude: 0,
        longitude: 0,
      },
    });
  });

  it('opening hours: open days, explicit days off, the rest unset', () => {
    const rows = toOpeningHours({ days: 'sat-thu', opens: '09:00', closes: '21:00', closed: 'fri' });
    expect(rows).toHaveLength(7);
    expect(rows.find((r) => r.day === 'Saturday')).toEqual({
      day: 'Saturday',
      opens: '09:00:00',
      closes: '21:00:00',
      closed: false,
    });
    expect(rows.find((r) => r.day === 'Friday')).toEqual({
      day: 'Friday',
      opens: null,
      closes: null,
      closed: true,
    });
    expect(toOpeningHours({ days: 'sat-wed', opens: '09:00', closes: '21:00', closed: 'none' })).toHaveLength(
      5,
    );
    expect(new Set(rows.map((r) => r.day)).size).toBe(rows.length); // one row per day (F02-S16)
  });

  it('a closing time before the opening time works past midnight; open and closed days may not overlap', () => {
    expect(isOvernight({ opens: '18:00', closes: '02:00' })).toBe(true);
    expect(isOvernight({ opens: '09:00', closes: '21:00' })).toBe(false);
    expect(closedOverlap({ days: 'all', opens: '09:00', closes: '21:00', closed: 'fri' })).toEqual([
      'Friday',
    ]);
    expect(closedOverlap({ days: 'sat-thu', opens: '09:00', closes: '21:00', closed: 'fri' })).toEqual([]);
  });
});
