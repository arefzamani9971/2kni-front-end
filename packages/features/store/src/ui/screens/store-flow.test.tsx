import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider, createQueryClient } from '@dukani/data';
import { compose, createApi, createFetchAdapter, withAuth, withErrorMapping, withIdempotency } from '@dukani/http';
import { FIXTURE } from '@dukani/testing';
import { createMockServer } from '@dukani/testing/node';
import { ToastProvider } from '@dukani/ui-kit';
import type { ReactNode } from 'react';
import { createStoreModule, StoreModuleProvider } from '../../module';
import { CreateStoreScreen } from './CreateStoreScreen';
import { StoresScreen } from './StoresScreen';

const BASE = 'http://api.test';
const mock = createMockServer({ baseUrl: BASE });
beforeAll(() => mock.server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mock.reset());
afterAll(() => mock.server.close());

const setup = async (mobile: string = FIXTURE.ownerMobile) => {
  let token: string | null = null;
  const http = compose(
    createFetchAdapter({ baseUrl: BASE }),
    withIdempotency,
    withAuth({ getAccessToken: () => token, refresh: async () => false, onSessionExpired: () => undefined }),
    withErrorMapping,
  );
  const api = createApi(http);
  const otp = await api.post('/api/v1/auth/otp/request', { body: { mobile }, auth: false });
  token = (await api.post('/api/v1/auth/otp/verify', { body: { requestId: otp.requestId, code: otp.devCode! }, auth: false })).accessToken;
  const module = createStoreModule({ api });
  return (ui: ReactNode) => (
    <DataProvider client={createQueryClient()}>
      <ToastProvider>
        <StoreModuleProvider value={module}>{ui}</StoreModuleProvider>
      </ToastProvider>
    </DataProvider>
  );
};

describe('store feature', () => {
  it('lists the fixture store with role and default mark (storeselect)', async () => {
    const wrap = await setup();
    render(wrap(<StoresScreen storeHref={(id) => `/s/${id}/home`} onCreate={vi.fn()} />));
    const link = await screen.findByRole('link', { name: /نوشت‌افزار آفتاب/ });
    expect(link).toHaveAttribute('href', `/s/${FIXTURE.storeId}/home`);
    expect(link).toHaveTextContent('مالک · فروشگاه پیش‌فرض');
  });

  it('creates a store after choosing its type in ST02', async () => {
    const user = userEvent.setup();
    const wrap = await setup(FIXTURE.newUserMobile);
    const onCreated = vi.fn();
    render(wrap(<CreateStoreScreen onCreated={onCreated} onBack={vi.fn()} />));
    await user.click(screen.getByRole('button', { name: 'ساخت فروشگاه' }));
    expect(await screen.findByText('نام فروشگاه را وارد کنید.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/نام فروشگاه/), 'لوازم‌التحریر مهتاب');
    await user.click(screen.getByRole('button', { name: /نوع فروشگاه/ }));
    await user.click(await screen.findByRole('radio', { name: /پوشاک/ }));
    await user.click(screen.getByRole('button', { name: 'انتخاب پوشاک' }));
    expect(screen.getByRole('button', { name: /نوع فروشگاه/ })).toHaveTextContent('پوشاک · تغییر نوع');
    await user.click(screen.getByRole('button', { name: 'عمده‌فروشی' }));
    await user.click(screen.getByRole('button', { name: 'ساخت فروشگاه' }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ name: 'لوازم‌التحریر مهتاب', role: 'Owner' })));
  });
});
