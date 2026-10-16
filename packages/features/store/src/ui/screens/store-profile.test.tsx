import { render } from '@dukani/i18n/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Dto } from '@dukani/contracts';
import { DataProvider, createDataClient } from '@dukani/data';
import { PERMISSIONS } from '@dukani/domain';
import {
  compose,
  createApi,
  createFetchAdapter,
  withAuth,
  withErrorMapping,
  withIdempotency,
} from '@dukani/http';
import { ActiveStoreProvider, createMemoryDraftStore, type ActiveStore } from '@dukani/platform';
import { FIXTURE } from '@dukani/testing';
import { createMockServer, http, HttpResponse } from '@dukani/testing/node';
import { ToastProvider } from '@dukani/ui-kit';
import type { ReactNode } from 'react';
import { toOpeningHours } from '../../domain/store-draft';
import type { StoreRepository } from '../../application/ports';
import { createStoreModule, StoreModuleProvider } from '../../module';
import { StoreEditScreen } from './StoreEditScreen';
import { StoreInfoScreen } from './StoreInfoScreen';

const BASE = 'http://api.test';
const mock = createMockServer({ baseUrl: BASE });
beforeAll(() => mock.server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mock.reset());
afterAll(() => mock.server.close());

/** PUT bodies by path, to prove what a save sends (full replace + version). */
let puts: { path: string; body: Record<string, unknown> }[] = [];
beforeEach(() => {
  puts = [];
  mock.server.events.removeAllListeners();
  mock.server.events.on('request:start', async ({ request }) => {
    if (request.method !== 'PUT') return;
    puts.push({
      path: new URL(request.url).pathname,
      body: (await request.clone().json()) as Record<string, unknown>,
    });
  });
});

const store = () => mock.db.state.stores.find((s) => s.id === FIXTURE.storeId)!;
const OWNER: ActiveStore = {
  id: FIXTURE.storeId,
  name: FIXTURE.storeName,
  storeTypeKey: 'stationery',
  role: 'Owner',
  permissions: [...PERMISSIONS],
};

/**
 * jsdom's FormData cannot cross Node's fetch, so multipart upload is replaced at the port: it does what
 * `POST /logo` does (new file id, new version, stale version → 409) and the editor around it is real.
 */
type UploadLogo = StoreRepository['uploadLogo'];
const fakeUpload =
  (get: StoreRepository['get']): UploadLogo =>
  async (storeId, _file, expectedVersion) => {
    if (expectedVersion !== store().version)
      throw { kind: 'Conflict', code: 'VERSION_CONFLICT', message: 'conflict' };
    Object.assign(store(), { logoFileId: 'logo-new', version: store().version + 1 });
    return get(storeId);
  };

const setup = async (active: ActiveStore = OWNER, upload?: (get: StoreRepository['get']) => UploadLogo) => {
  let token: string | null = null;
  const client = compose(
    createFetchAdapter({ baseUrl: BASE }),
    withIdempotency,
    withAuth({ getAccessToken: () => token, refresh: async () => false, onSessionExpired: () => undefined }),
    withErrorMapping,
  );
  const api = createApi(client);
  const otp = await api.post('/api/v1/auth/otp/request', {
    body: { mobile: FIXTURE.ownerMobile },
    auth: false,
  });
  token = (
    await api.post('/api/v1/auth/otp/verify', {
      body: { requestId: otp.requestId, code: otp.devCode! },
      auth: false,
    })
  ).accessToken;
  const base = createStoreModule({
    api,
    drafts: createMemoryDraftStore(),
    userId: () => FIXTURE.ownerMobile,
  });
  const module = { ...base, stores: { ...base.stores, uploadLogo: (upload ?? fakeUpload)(base.stores.get) } };
  return (ui: ReactNode) => (
    <DataProvider client={createDataClient()}>
      <ToastProvider>
        <StoreModuleProvider value={module}>
          <ActiveStoreProvider value={active}>{ui}</ActiveStoreProvider>
        </StoreModuleProvider>
      </ToastProvider>
    </DataProvider>
  );
};

const withProfile = () =>
  Object.assign(store(), {
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
  });

describe('STORE-04 store info (Figma 385:6853)', () => {
  it('shows the real profile and the edit entries; release-3.0 cards are not rendered', async () => {
    withProfile();
    const wrap = await setup();
    render(
      wrap(
        <StoreInfoScreen
          storeId={FIXTURE.storeId}
          editHref="/edit"
          contactHref="/contact"
          privateHref="/private"
        />,
      ),
    );
    expect(await screen.findByRole('heading', { level: 1, name: 'اطلاعات و تنظیمات' })).toBeInTheDocument();
    expect(screen.getByText('نوع: لوازم‌التحریر')).toBeInTheDocument();
    expect(screen.getByText('تهران، خیابان انقلاب')).toBeInTheDocument();
    expect(screen.getByText('کد پستی: ۰۱۲۳۴۵۶۷۸۹ · ساعت کاری: ۹ تا ۲۱')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ویرایش اطلاعات و تنظیمات' })).toHaveAttribute('href', '/edit');
    expect(screen.getByRole('link', { name: 'تماس، نشانی و تصویر' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'اطلاعات خصوصی مالک و تسویه' })).toHaveAttribute(
      'href',
      '/private',
    );
    expect(screen.queryByText('روش‌های فروش')).not.toBeInTheDocument();
  });

  it('a member without store.settings reads the info but gets no edit entries', async () => {
    const wrap = await setup({ ...OWNER, role: 'Staff', permissions: ['sale.cash'] });
    render(
      wrap(<StoreInfoScreen storeId={FIXTURE.storeId} editHref="/e" contactHref="/c" privateHref="/p" />),
    );
    expect(await screen.findByText(FIXTURE.storeName)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ویرایش/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /اطلاعات خصوصی/ })).not.toBeInTheDocument();
  });
});

describe('F03 contact page (storeprofile 358:481) of an existing store', () => {
  it('saves only what changed on top of the latest store, with its version (F03-S02, S04, §8)', async () => {
    withProfile();
    const version = store().version;
    const user = userEvent.setup();
    const onDone = vi.fn();
    const wrap = await setup();
    render(wrap(<StoreEditScreen storeId={FIXTURE.storeId} entry="contact" onDone={onDone} />));
    const phone = await screen.findByLabelText(/تلفن تماس عمومی/);
    await user.clear(phone);
    await user.type(phone, '۰۲۱-۸۸۷۷۶۶۵۵');
    await user.click(screen.getByRole('button', { name: 'ذخیره اطلاعات' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const body = puts.find((p) => p.path.endsWith('/profile'))!.body;
    expect(body).toMatchObject({
      name: FIXTURE.storeName,
      phone: '02188776655',
      email: 'shop@example.com',
      expectedVersion: version,
      address: { line: 'خیابان انقلاب', postalCode: '0123456789', latitude: 0, longitude: 0 },
    });
    expect(body.openingHours).toHaveLength(7); // hours were not on this page and are kept
  });

  it('a concurrent change is a conflict, not an overwrite; saving again applies the edit on the new version (F03-S16)', async () => {
    withProfile();
    const user = userEvent.setup();
    const onDone = vi.fn();
    const wrap = await setup();
    render(wrap(<StoreEditScreen storeId={FIXTURE.storeId} entry="contact" onDone={onDone} />));
    const email = await screen.findByLabelText(/ایمیل/);
    // another editor saves meanwhile
    Object.assign(store(), { name: 'آفتاب نو', version: store().version + 1 });
    await user.clear(email);
    await user.type(email, 'new@example.com');
    await user.click(screen.getByRole('button', { name: 'ذخیره اطلاعات' }));
    expect(await screen.findByText('این اطلاعات هم‌زمان تغییر کرده است')).toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
    expect(store().email).toBe('shop@example.com');
    expect(screen.getByLabelText(/ایمیل/)).toHaveValue('new@example.com'); // the user's edit is kept
    await user.click(screen.getByRole('button', { name: 'ذخیره اطلاعات' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(store()).toMatchObject({ name: 'آفتاب نو', email: 'new@example.com' });
  });

  it('a picked logo is uploaded at once and a later text save keeps it (F03-S13)', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    const wrap = await setup();
    const { container } = render(
      wrap(<StoreEditScreen storeId={FIXTURE.storeId} entry="contact" onDone={onDone} />),
    );
    await screen.findByLabelText(/تلفن تماس عمومی/);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(['x'], 'logo.png', { type: 'image/png' }));
    await waitFor(() => expect(store().logoFileId).toBe('logo-new'));
    const version = store().version;
    await user.click(screen.getByRole('button', { name: 'ذخیره اطلاعات' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    // the text save went out on the version the upload returned, with the new logo
    expect(puts.find((p) => p.path.endsWith('/profile'))!.body).toMatchObject({
      logoFileId: 'logo-new',
      expectedVersion: version,
    });
  });

  it('a failed logo upload keeps the typed text (F03-S14)', async () => {
    const user = userEvent.setup();
    const wrap = await setup(OWNER, () => async () => {
      throw { kind: 'Server', code: 'SERVER_ERROR', message: 'خطای سرور' };
    });
    const { container } = render(
      wrap(<StoreEditScreen storeId={FIXTURE.storeId} entry="contact" onDone={vi.fn()} />),
    );
    const email = await screen.findByLabelText(/ایمیل/);
    await user.type(email, 'a@b.ir');
    await user.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      new File(['x'], 'l.png', { type: 'image/png' }),
    );
    expect(await screen.findByText('تصویر بارگذاری نشد')).toBeInTheDocument();
    expect(screen.getByLabelText(/ایمیل/)).toHaveValue('a@b.ir');
  });
});

describe('STORE-05 edit (Figma 385:6912)', () => {
  it('a new store type is saved only after its preview is confirmed; products are kept (F03-S15)', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    const wrap = await setup();
    render(wrap(<StoreEditScreen storeId={FIXTURE.storeId} entry="edit" onDone={onDone} />));
    await user.click(await screen.findByRole('button', { name: /نوع فروشگاه/ }));
    await user.click(await screen.findByRole('radio', { name: /پوشاک/ }));
    await user.click(screen.getByRole('button', { name: 'انتخاب پوشاک' }));
    await user.click(await screen.findByRole('button', { name: 'ذخیره تغییرات' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/کالای فروشگاه و همهٔ فاکتورها و سوابق حفظ می‌شوند/)).toBeInTheDocument();
    expect(puts).toHaveLength(0);
    await user.click(within(dialog).getByRole('button', { name: 'تغییر نوع و ذخیره' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(store().storeTypeId).not.toBe(OWNER.storeTypeKey);
    expect(puts[0]!.body).toMatchObject({ name: FIXTURE.storeName, phone: '02144556677' });
  });

  it('a failed type-change save keeps the confirmation open with its error; a double click saves once (PAT-DELETE-01)', async () => {
    let failures = 1;
    mock.server.use(
      // the first save fails slowly, so the second click of a double click lands while it is still running
      http.put(`${BASE}/api/v1/stores/:storeId/profile`, async () => {
        if (failures-- <= 0) return undefined;
        await new Promise((resolve) => setTimeout(resolve, 150));
        return HttpResponse.json({ title: 'خطای سرور', status: 500, code: 'INTERNAL' }, { status: 500 });
      }),
    );
    const user = userEvent.setup();
    const onDone = vi.fn();
    const wrap = await setup();
    render(wrap(<StoreEditScreen storeId={FIXTURE.storeId} entry="edit" onDone={onDone} />));
    await user.click(await screen.findByRole('button', { name: /نوع فروشگاه/ }));
    await user.click(await screen.findByRole('radio', { name: /پوشاک/ }));
    await user.click(screen.getByRole('button', { name: 'انتخاب پوشاک' }));
    await user.click(await screen.findByRole('button', { name: 'ذخیره تغییرات' }));
    const dialog = await screen.findByRole('dialog');
    await user.dblClick(within(dialog).getByRole('button', { name: 'تغییر نوع و ذخیره' }));
    expect(await within(dialog).findByText('ذخیره انجام نشد')).toBeInTheDocument();
    expect(puts.filter((p) => p.path.endsWith('/profile'))).toHaveLength(1);
    expect(onDone).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'تغییر نوع و ذخیره' }));
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(puts.filter((p) => p.path.endsWith('/profile'))).toHaveLength(2);
  });

  it('leaving with unsaved edits asks first (leaveform 594:6931)', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    const wrap = await setup();
    render(wrap(<StoreEditScreen storeId={FIXTURE.storeId} entry="edit" onDone={onDone} />));
    const name = await screen.findByLabelText(/نام فروشگاه/);
    await user.type(name, ' ۲');
    await user.click(screen.getAllByRole('button', { name: 'بازگشت' })[0]!);
    expect(
      await screen.findByRole('heading', { level: 2, name: 'تغییرات ذخیره نشده‌اند' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ادامه ویرایش' }));
    expect(await screen.findByLabelText(/نام فروشگاه/)).toHaveValue(`${FIXTURE.storeName} ۲`);
    expect(onDone).not.toHaveBeenCalled();
  });
});

describe('F03 private page (storelegal 358:482)', () => {
  it('reads and saves with its own version; the account number keeps its leading zeros (F03-S17)', async () => {
    store().privateInfo = {
      ownerName: 'علی رضایی',
      nationalId: null,
      licenseNo: null,
      iban: null,
      cardNumber: null,
      accountNumber: '0012',
      version: 3,
    };
    const user = userEvent.setup();
    const onDone = vi.fn();
    const wrap = await setup();
    render(wrap(<StoreEditScreen storeId={FIXTURE.storeId} entry="private" onDone={onDone} />));
    expect(await screen.findByDisplayValue('علی رضایی')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ذخیره' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const body = puts.find((p) => p.path.endsWith('/private-info'))!.body as Dto<'StorePrivateInfoDto'>;
    expect(body).toMatchObject({ ownerName: 'علی رضایی', accountNumber: '0012', version: 3 });
    expect(puts.some((p) => p.path.endsWith('/profile'))).toBe(false); // private save never touches the profile
  });

  it('a private read failure stays inside the section (F03-S12)', async () => {
    mock.server.use(
      http.get(`${BASE}/api/v1/stores/:storeId/private-info`, () =>
        HttpResponse.json(
          { title: 'اجازه ندارید.', status: 403, code: 'PERMISSION_DENIED' },
          { status: 403 },
        ),
      ),
    );
    const wrap = await setup();
    render(wrap(<StoreEditScreen storeId={FIXTURE.storeId} entry="private" onDone={vi.fn()} />));
    expect(await screen.findByText('اجازه ندارید.')).toBeInTheDocument();
    render(
      wrap(<StoreInfoScreen storeId={FIXTURE.storeId} editHref="/e" contactHref="/c" privateHref="/p" />),
    );
    expect(await screen.findByText('نوع: لوازم‌التحریر')).toBeInTheDocument();
  });
});
