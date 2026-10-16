import { render } from '@dukani/i18n/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider, createDataClient } from '@dukani/data';
import {
  compose,
  createApi,
  createFetchAdapter,
  withAuth,
  withErrorMapping,
  withIdempotency,
} from '@dukani/http';
import { createMemoryDraftStore, type DraftStore } from '@dukani/platform';
import { FIXTURE } from '@dukani/testing';
import { createMockServer, http, HttpResponse } from '@dukani/testing/node';
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

/** Every request the screens send: `METHOD /path`. */
let sent: string[] = [];
beforeEach(() => {
  sent = [];
  mock.server.events.removeAllListeners();
  mock.server.events.on('request:start', ({ request }) => {
    sent.push(`${request.method} ${new URL(request.url).pathname}`);
  });
});
const creates = () => sent.filter((r) => r === 'POST /api/v1/stores').length;

const setup = async (mobile: string = FIXTURE.ownerMobile, drafts: DraftStore = createMemoryDraftStore()) => {
  let token: string | null = null;
  const client = compose(
    createFetchAdapter({ baseUrl: BASE }),
    withIdempotency,
    withAuth({ getAccessToken: () => token, refresh: async () => false, onSessionExpired: () => undefined }),
    withErrorMapping,
  );
  const api = createApi(client);
  const otp = await api.post('/api/v1/auth/otp/request', { body: { mobile }, auth: false });
  token = (
    await api.post('/api/v1/auth/otp/verify', {
      body: { requestId: otp.requestId, code: otp.devCode! },
      auth: false,
    })
  ).accessToken;
  sent = [];
  const module = createStoreModule({ api, drafts, userId: () => mobile });
  return (ui: ReactNode) => (
    <DataProvider client={createDataClient()}>
      <ToastProvider>
        <StoreModuleProvider value={module}>{ui}</StoreModuleProvider>
      </ToastProvider>
    </DataProvider>
  );
};

/** setup: name + ST02 type (Figma 312:8744 → 385:6827). */
const fillRequired = async (user: ReturnType<typeof userEvent.setup>, name = 'لوازم‌التحریر مهتاب') => {
  await user.type(await screen.findByLabelText(/نام فروشگاه/), name);
  await user.click(screen.getByRole('button', { name: /نوع فروشگاه/ }));
  await user.click(await screen.findByRole('radio', { name: /پوشاک/ }));
  await user.click(screen.getByRole('button', { name: 'انتخاب پوشاک' }));
};

describe('storeselect (F02 §4)', () => {
  it('lists the fixture store with role and default mark', async () => {
    const wrap = await setup();
    render(wrap(<StoresScreen storeHref={(id) => `/s/${id}/home`} onCreate={vi.fn()} />));
    const link = await screen.findByRole('link', { name: /نوشت‌افزار آفتاب/ });
    expect(link).toHaveAttribute('href', `/s/${FIXTURE.storeId}/home`);
    expect(link).toHaveTextContent('مالک · فروشگاه پیش‌فرض');
  });

  it('keeps the four collections apart: only memberships enter the panel (AC05, F02-S18/S19)', async () => {
    const wrap = await setup();
    mock.server.use(
      http.get(`${BASE}/api/v1/stores`, () =>
        HttpResponse.json({
          stores: [],
          invitations: [
            {
              invitationId: 'i1',
              storeId: 's1',
              storeName: 'فروشگاه مهر',
              invitedByName: null,
              expiresAt: '2026-10-10T00:00:00Z',
            },
          ],
          ownershipTransfers: [
            {
              transferId: 't1',
              storeId: 's2',
              storeName: 'کتاب‌فروشی نور',
              expiresAt: '2026-10-10T00:00:00Z',
            },
          ],
          deactivatedStores: [
            { storeId: 's3', storeName: 'فروشگاه قدیمی', deactivatedAt: null, canReactivate: false },
          ],
        }),
      ),
    );
    render(wrap(<StoresScreen storeHref={(id) => `/s/${id}/home`} onCreate={vi.fn()} />));
    expect(await screen.findByText(/دعوت به همکاری/)).toBeInTheDocument();
    expect(screen.getByText(/انتقال مالکیت به شما/)).toBeInTheDocument();
    expect(screen.getByText(/با پشتیبانی تماس بگیرید/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument(); // no «ورود به پنل» for any of them
    expect(screen.queryByText('هنوز فروشگاهی ندارید')).not.toBeInTheDocument();
  });
});

describe('setup → STORE-SUCCESS (F02 §8)', () => {
  it('name + type are enough: one POST, Retail sent explicitly, no profile PUT (F02-S01/S02/S05)', async () => {
    const user = userEvent.setup();
    const wrap = await setup(FIXTURE.newUserMobile);
    let body: unknown = null;
    mock.server.events.on('request:start', async ({ request }) => {
      if (request.method === 'POST' && request.url.endsWith('/api/v1/stores'))
        body = await request.clone().json();
    });
    render(wrap(<CreateStoreScreen onBack={vi.fn()} onExit={vi.fn()} />));
    await user.click(await screen.findByRole('button', { name: 'ساخت فروشگاه' }));
    expect(await screen.findByText('نام فروشگاه را وارد کنید.')).toBeInTheDocument();
    expect(creates()).toBe(0);

    await fillRequired(user);
    expect(screen.getByRole('button', { name: /نوع فروشگاه/ })).toHaveTextContent('پوشاک · انتخاب نوع');
    await user.click(screen.getByRole('button', { name: 'ساخت فروشگاه' }));
    expect(await screen.findByText('فروشگاه «لوازم‌التحریر مهتاب» ساخته شد')).toBeInTheDocument();
    expect(creates()).toBe(1);
    expect(body).toMatchObject({ businessMode: 'Retail' });
    expect(
      sent.some((r) => r.endsWith('/profile') || r.endsWith('/private-info') || r.endsWith('/logo')),
    ).toBe(false);
  });

  it('«ثبت بقیه اطلاعات» only edits the draft; the create then saves every section on the same id (F02-S03/S04)', async () => {
    const user = userEvent.setup();
    const wrap = await setup(FIXTURE.newUserMobile);
    render(wrap(<CreateStoreScreen onBack={vi.fn()} onExit={vi.fn()} />));
    await fillRequired(user);

    await user.click(screen.getByRole('button', { name: 'ثبت بقیه اطلاعات (اختیاری)' }));
    expect(screen.getByText('تماس و نشانی · ۱ از ۲')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/تلفن تماس عمومی/), '02188880000');
    await user.type(screen.getByLabelText(/کد پستی/), '0012345678');
    await user.click(screen.getByRole('button', { name: 'ذخیره و ادامه' }));
    expect(screen.getByText('مالک و تسویه · ۲ از ۲')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/شماره حساب/), '0012345');
    await user.click(screen.getByRole('button', { name: 'ذخیره' }));
    expect(creates()).toBe(0); // nothing was sent before «ساخت فروشگاه»

    await user.click(screen.getByRole('button', { name: 'ساخت فروشگاه' }));
    expect(await screen.findAllByText('ذخیره شد')).toHaveLength(2);
    expect(creates()).toBe(1);
    const created = sent.find((r) => r.startsWith('PUT') && r.endsWith('/profile'))!.split('/')[4];
    expect(sent).toContain(`PUT /api/v1/stores/${created}/private-info`);
    const store = mock.db.state.stores.find((s) => s.id === created)!;
    expect(store.phone).toBe('02188880000');
    expect(store.address?.postalCode).toBe('0012345678'); // leading zeros kept (AC06)
    expect(store.privateInfo?.accountNumber).toBe('0012345');
  });

  it('a failed profile save is retried alone; the store is never created twice (F02-S08, AC04)', async () => {
    const user = userEvent.setup();
    const wrap = await setup(FIXTURE.newUserMobile);
    let failProfile = true;
    mock.server.use(
      http.put(`${BASE}/api/v1/stores/:storeId/profile`, () =>
        failProfile
          ? HttpResponse.json({ title: 'خطای سرور', status: 500, code: 'INTERNAL' }, { status: 500 })
          : undefined,
      ),
    );
    render(wrap(<CreateStoreScreen onBack={vi.fn()} onExit={vi.fn()} />));
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'ثبت بقیه اطلاعات (اختیاری)' }));
    await user.type(screen.getByLabelText(/ایمیل/), 'shop@example.com');
    await user.click(screen.getByRole('button', { name: 'بعداً تکمیل می‌کنم' }));
    // «بعداً» drops this screen's edits: nothing optional is left → no profile PUT at all
    await user.click(screen.getByRole('button', { name: 'ثبت بقیه اطلاعات (اختیاری)' }));
    await user.type(screen.getByLabelText(/ایمیل/), 'shop@example.com');
    await user.click(screen.getByRole('button', { name: 'ذخیره و ادامه' }));
    await user.click(screen.getByRole('button', { name: 'بعداً تکمیل می‌کنم' }));

    await user.click(screen.getByRole('button', { name: 'ساخت فروشگاه' }));
    expect(await screen.findByText('فروشگاه ساخته شد؛ بخشی از اطلاعات تکمیلی ذخیره نشد')).toBeInTheDocument();
    failProfile = false;
    await user.click(screen.getByRole('button', { name: 'تلاش دوباره' }));
    expect(await screen.findByText('ذخیره شد')).toBeInTheDocument();
    expect(creates()).toBe(1);
    expect(sent.filter((r) => r.endsWith('/profile'))).toHaveLength(2);
  });

  it('typing the name writes the pending draft after a pause, not on every key (PAT-FORM-01)', async () => {
    const user = userEvent.setup();
    const drafts = createMemoryDraftStore();
    const put = vi.spyOn(drafts, 'put');
    const wrap = await setup(FIXTURE.newUserMobile, drafts);
    render(wrap(<CreateStoreScreen onBack={vi.fn()} onExit={vi.fn()} />));
    const name = 'لوازم‌التحریر مهتاب';
    await user.type(await screen.findByLabelText(/نام فروشگاه/), name);
    await waitFor(() =>
      expect(put).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ name })),
    );
    expect(put.mock.calls.length).toBeLessThan(name.length / 2);
  });

  it('the draft survives a remount; after a create the remount resumes the result without a second POST', async () => {
    const user = userEvent.setup();
    const drafts = createMemoryDraftStore();
    const wrap = await setup(FIXTURE.newUserMobile, drafts);
    const first = render(wrap(<CreateStoreScreen onBack={vi.fn()} onExit={vi.fn()} />));
    await fillRequired(user, 'فروشگاه ماندگار');
    first.unmount();

    const second = render(wrap(<CreateStoreScreen onBack={vi.fn()} onExit={vi.fn()} />));
    expect(await screen.findByLabelText(/نام فروشگاه/)).toHaveValue('فروشگاه ماندگار');
    await user.click(screen.getByRole('button', { name: 'ساخت فروشگاه' }));
    await screen.findByText('فروشگاه «فروشگاه ماندگار» ساخته شد');
    second.unmount();

    const onExit = vi.fn();
    render(wrap(<CreateStoreScreen onBack={vi.fn()} onExit={onExit} />));
    expect(await screen.findByText('فروشگاه «فروشگاه ماندگار» ساخته شد')).toBeInTheDocument();
    expect(creates()).toBe(1);
    await user.click(screen.getByRole('button', { name: 'ثبت اولین کالا' }));
    await waitFor(() =>
      expect(onExit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'فروشگاه ماندگار' }),
        'first-product',
      ),
    );
    expect(
      await drafts.list({ storeId: 'pending', userId: FIXTURE.newUserMobile, flow: 'store-create' }),
    ).toHaveLength(0);
  });

  it('another account never sees the pending draft (F02-S20)', async () => {
    const user = userEvent.setup();
    const drafts = createMemoryDraftStore();
    const wrapA = await setup(FIXTURE.newUserMobile, drafts);
    const a = render(wrapA(<CreateStoreScreen onBack={vi.fn()} onExit={vi.fn()} />));
    await user.type(await screen.findByLabelText(/نام فروشگاه/), 'پیش‌نویس الف');
    a.unmount();
    const wrapB = await setup(FIXTURE.ownerMobile, drafts);
    render(wrapB(<CreateStoreScreen onBack={vi.fn()} onExit={vi.fn()} />));
    expect(await screen.findByLabelText(/نام فروشگاه/)).toHaveValue('');
  });
});
