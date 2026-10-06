import type { StoreProfile } from './store-profile-model.types';
import { describe, expect, it } from 'vitest';
import { toOpeningHours } from './store-draft';
import {
  applyProfilePatch,
  contactFromStore,
  contactFields,
  describeOpeningTimes,
  hoursPlanFromRows,
  storeInfoView,
} from './store-profile';

const store: StoreProfile = {
  id: 's1',
  name: 'نوشت‌افزار آفتاب',
  storeType: { id: 'type', key: 'stationery', name: 'لوازم‌التحریر' },
  businessMode: 'Both',
  phone: '02188776655',
  email: 'shop@example.com',
  address: {
    province: null,
    city: 'تهران',
    line: 'خیابان انقلاب',
    postalCode: '0123456789',
    latitude: 0,
    longitude: 0,
  },
  openingHours: toOpeningHours({ days: 'sat-thu', opens: '09:00', closes: '21:00', closed: 'fri' }),
  logoFileId: 'logo-1',
  logoUrl: null,
  version: 42,
};

describe('F03 profile full-replace merge', () => {
  it('an empty patch (Skip) sends back every current value with the read version (F03-S02, §12)', () => {
    const body = applyProfilePatch(store, {});
    expect(body).toEqual({
      name: store.name,
      storeTypeId: 'type',
      businessMode: 'Both',
      phone: '02188776655',
      email: 'shop@example.com',
      address: {
        province: null,
        city: 'تهران',
        line: 'خیابان انقلاب',
        postalCode: '0123456789',
        latitude: 0,
        longitude: 0,
      },
      openingHours: store.openingHours,
      logoFileId: 'logo-1',
      version: 42,
    });
  });

  it('editing one section never wipes another; the postal code keeps its leading zero (F03-S04, §14 DoD)', () => {
    const body = applyProfilePatch(store, { name: 'آفتاب ۲', businessMode: null });
    expect(body.address).toEqual(store.address);
    expect(body.openingHours).toEqual(store.openingHours);
    expect(body.address?.postalCode).toBe('0123456789');
    // null business mode stays null — never turned into Retail
    expect(body.businessMode).toBeNull();
  });

  it('an explicit clear is sent as null and differs from untouched (F03-S18)', () => {
    const cleared = applyProfilePatch(store, contactFields({ ...contactFromStore(store), phone: null }));
    expect(cleared.phone).toBeNull();
    expect(cleared.email).toBe(store.email);
    // the same values again change nothing
    expect(applyProfilePatch(store, contactFields(contactFromStore(store)))).toEqual(
      applyProfilePatch(store, {}),
    );
  });

  it('location 0/0 is valid and is removed only on purpose (F03-S08)', () => {
    expect(applyProfilePatch(store, {}).address).toMatchObject({ latitude: 0, longitude: 0 });
    expect(applyProfilePatch(store, { location: null }).address).toMatchObject({
      latitude: null,
      longitude: null,
    });
    const bare = { ...store, address: null };
    expect(applyProfilePatch(bare, {}).address).toBeNull();
  });

  it('a type change keeps everything else (F03 §10)', () => {
    const body = applyProfilePatch(store, { storeTypeId: 'other' });
    expect(body.storeTypeId).toBe('other');
    expect(body.logoFileId).toBe('logo-1');
  });
});

describe('F03 opening hours round trip', () => {
  it('rows saved from a preset open the hours step on the same preset', () => {
    expect(hoursPlanFromRows(store.openingHours)).toEqual({
      days: 'sat-thu',
      opens: '09:00',
      closes: '21:00',
      closed: 'fri',
    });
    expect(hoursPlanFromRows([])).toBeNull();
  });

  it('per-day times are not forced into a preset', () => {
    const rows = [
      { day: 'Saturday', opens: '09:00:00', closes: '21:00:00', closed: false },
      { day: 'Sunday', opens: '10:00:00', closes: '18:00:00', closed: false },
    ] as const;
    expect(hoursPlanFromRows(rows)).toBeNull();
    expect(describeOpeningTimes(rows)).toBeNull();
  });

  it('overnight hours stay readable (F03-S11)', () => {
    const rows = toOpeningHours({ days: 'all', opens: '22:00', closes: '06:00', closed: 'none' });
    expect(describeOpeningTimes(rows)).toBe('۲۲ تا ۶');
  });
});

describe('STORE-04 read model', () => {
  it('shows the Figma lines from real data', () => {
    expect(storeInfoView(store)).toEqual({
      name: 'نوشت‌افزار آفتاب',
      typeName: 'لوازم‌التحریر',
      businessMode: 'خرده‌فروشی و عمده‌فروشی',
      address: 'تهران، خیابان انقلاب',
      contact: 'تماس: ۰۲۱۸۸۷۷۶۶۵۵ · shop@example.com',
      postalAndHours: 'کد پستی: ۰۱۲۳۴۵۶۷۸۹ · ساعت کاری: ۹ تا ۲۱',
    });
  });

  it('missing values are absent, not placeholders', () => {
    const empty = { ...store, phone: null, email: null, address: null, openingHours: [], businessMode: null };
    expect(storeInfoView(empty)).toMatchObject({
      address: null,
      contact: null,
      postalAndHours: null,
      businessMode: null,
    });
  });
});
