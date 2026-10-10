import { screen } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import type { StoreProfile } from '../../domain/store-profile-model.types';
import { toOpeningHours } from '../../domain/store-draft';
import { useStoreInfoView } from './use-store-info-view';

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
function Probe({ value }: { value: StoreProfile }) {
  const view = useStoreInfoView();
  return <output>{JSON.stringify(view(value))}</output>;
}
const viewOf = (value: StoreProfile) => {
  render(<Probe value={value} />);
  return JSON.parse(screen.getByRole('status').textContent ?? '{}') as Record<string, string | null>;
};

describe('STORE-04 read model (Figma 385:6853)', () => {
  it('shows the Figma lines from real data', () => {
    expect(viewOf(store)).toEqual({
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
    expect(viewOf(empty)).toMatchObject({
      address: null,
      contact: null,
      postalAndHours: null,
      businessMode: null,
    });
  });
});
