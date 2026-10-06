import type { Dto } from '@dukani/contracts';
import { describe, expect, it } from 'vitest';
import { applyProfilePatch } from '../domain/store-profile';
import { buildPrivateUpdate } from '../domain/store-draft';
import {
  privateInfoFromDto,
  privateInfoToDto,
  profileUpdateToDto,
  storeDetailFromDto,
} from './store-mappers';

const response = (): Dto<'StoreDto'> => ({
  id: 'store',
  name: 'آفتاب',
  storeType: { id: 'type', key: 'stationery', name: 'نوشت‌افزار' },
  openingHours: [{ day: 'Friday', closed: true }],
  timeZoneId: 'Asia/Tehran',
  myRole: 'Owner',
  myPermissions: ['store.settings'],
  completion: { hasContact: false, hasAddress: false, hasHours: true, hasPrivateInfo: false },
  version: 42,
});

describe('store HTTP boundary', () => {
  it('normalizes omitted JSON fields and separates access metadata from the editable profile', () => {
    const detail = storeDetailFromDto(response());
    expect(detail.role).toBe('Owner');
    expect(detail.permissions).toEqual(['store.settings']);
    expect(detail.profile).toMatchObject({
      businessMode: null,
      phone: null,
      email: null,
      address: null,
      logoFileId: null,
      logoUrl: null,
      openingHours: [{ day: 'Friday', opens: null, closes: null, closed: true }],
    });
    expect(detail.profile).not.toHaveProperty('myPermissions');
    expect(detail.profile).not.toHaveProperty('completion');
    expect(detail.profile).not.toHaveProperty('timeZoneId');
  });

  it('preserves zero coordinates, leading zeros and explicit clears through read, edit and write', () => {
    const dto = response();
    dto.phone = '02112345678';
    dto.address = { latitude: 0, longitude: 0, postalCode: '0012345678' };
    const update = applyProfilePatch(storeDetailFromDto(dto).profile, { phone: null });
    const body = profileUpdateToDto({ ...update, uiOnly: 'must not leak' } as typeof update);
    expect(body.phone).toBeNull();
    expect(body.address).toEqual({
      province: null,
      city: null,
      line: null,
      postalCode: '0012345678',
      latitude: 0,
      longitude: 0,
    });
    expect(body.expectedVersion).toBe(42);
    expect(body).not.toHaveProperty('version');
    expect(body).not.toHaveProperty('uiOnly');
  });

  it('does not retain references to mutable transport objects', () => {
    const dto = response();
    dto.address = { city: 'تهران' };
    const detail = storeDetailFromDto(dto);
    dto.storeType.name = 'changed';
    dto.myPermissions.length = 0;
    dto.address.city = 'changed';
    dto.openingHours[0]!.closed = false;
    expect(detail.profile.storeType.name).toBe('نوشت‌افزار');
    expect(detail.permissions).toEqual(['store.settings']);
    expect(detail.profile.address?.city).toBe('تهران');
    expect(detail.profile.openingHours[0]!.closed).toBe(true);
  });

  it('keeps private section versions independent and preserves account-number strings', () => {
    const empty = privateInfoFromDto({});
    expect(empty).toEqual({
      ownerName: null,
      nationalId: null,
      licenseNo: null,
      iban: null,
      cardNumber: null,
      accountNumber: null,
      version: null,
    });
    const current = privateInfoFromDto({ accountNumber: '000123', version: 9 });
    const body = privateInfoToDto(buildPrivateUpdate({ ...current, ownerName: 'مالک' }, current.version));
    expect(body).toMatchObject({ accountNumber: '000123', ownerName: 'مالک', version: 9 });
    expect(body).not.toHaveProperty('expectedVersion');
  });
});
