import { render } from '@dukani/i18n/testing';
import { screen } from '@testing-library/react';
import { DataProvider, createDataClient } from '@dukani/data';
import { createApi } from '@dukani/http';
import { ActiveStoreProvider } from '@dukani/platform';
import { createStoreModule, StoreModuleProvider } from '../../module';
import { StoreQrScreen } from './StoreQrScreen';

const setup = (allowed = true) => {
  const module = createStoreModule({ api: createApi({ request: vi.fn() }) });
  const qr = vi.fn().mockResolvedValue({
    publicCode: 'ABCD2345',
    joinUrl: 'https://customer.2kni.ir/join/ABCD2345',
    displayName: 'فروشگاه آفتاب',
    address: 'تهران',
    available: false,
  });
  module.stores.qr = qr;
  render(
    <DataProvider client={createDataClient()}>
      <ActiveStoreProvider
        value={{
          id: 'store-1',
          name: 'فروشگاه آفتاب',
          storeTypeKey: 'stationery',
          role: 'Staff',
          permissions: allowed ? ['store.settings'] : [],
        }}
      >
        <StoreModuleProvider value={module}>
          <StoreQrScreen storeId="store-1" onBack={vi.fn()} />
        </StoreModuleProvider>
      </ActiveStoreProvider>
    </DataProvider>,
  );
  return qr;
};

it('renders the actual join link and store introduction, with the rollout gate visible', async () => {
  const qr = setup();
  const image = await screen.findByRole('img', { name: 'اسکن برای ورود و عضویت همین فروشگاه' });
  expect(image.getAttribute('src')?.startsWith('data:image/png;base64,')).toBe(true);
  expect(screen.getByText('https://customer.2kni.ir/join/ABCD2345')).toBeVisible();
  expect(screen.getByText('تهران')).toBeVisible();
  expect(screen.getByText('عضویت آنلاین این فروشگاه هنوز در دسترس نیست.')).toBeVisible();
  expect(qr).toHaveBeenCalledOnce();
});

it('does not fetch or expose QR settings without the store settings permission', async () => {
  const qr = setup(false);
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'چاپ' })).toBeDisabled();
  expect(qr).not.toHaveBeenCalled();
});
