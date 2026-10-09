import { render } from '@dukani/i18n/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toPersianDigits } from '@dukani/domain';
import { DataProvider, createDataClient } from '@dukani/data';
import { compose, createApi, createFetchAdapter, withErrorMapping, withIdempotency } from '@dukani/http';
import { createMemorySession, createMemoryStorage } from '@dukani/platform';
import { FIXTURE, SEND_FAILED_MOBILE } from '@dukani/testing';
import { createMockServer, http, HttpResponse } from '@dukani/testing/node';
import { ToastProvider } from '@dukani/ui-kit';
import type { ReactNode } from 'react';
import { AuthModuleProvider, createAuthModule } from '../../module';
import { LoginScreen } from './LoginScreen';
import { OtpScreen } from './OtpScreen';

const BASE = 'http://api.test';
const mock = createMockServer({ baseUrl: BASE });
beforeAll(() => mock.server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mock.reset());
afterAll(() => mock.server.close());

const setup = (layout: 'split' | 'cards' = 'split', showDevCode = true) => {
  const http = compose(createFetchAdapter({ baseUrl: BASE }), withIdempotency, withErrorMapping);
  const storage = createMemoryStorage();
  const session = createMemorySession(createMemoryStorage());
  const module = createAuthModule({
    mode: 'mock',
    api: createApi(http),
    sameOriginHttp: http,
    session,
    storage,
    layout,
    showDevCode,
  });
  const wrap = (ui: ReactNode) => (
    <DataProvider client={createDataClient()}>
      <ToastProvider>
        <AuthModuleProvider value={module}>{ui}</AuthModuleProvider>
      </ToastProvider>
    </DataProvider>
  );
  return { module, session, wrap };
};

describe('auth flow against the mock backend', () => {
  it.each([false, true])(
    'replaces the challenge on resend (expired: %s), then verifies the new code',
    async (expired) => {
      const user = userEvent.setup();
      const { wrap, module } = setup();
      const original = await module.gateway.requestOtp(FIXTURE.ownerMobile);
      mock.db.state.otps.find((otp) => otp.requestId === original.requestId)!.resendAt = Date.now() - 1;
      module.challenges.save({
        ...original,
        resendAvailableAt: new Date(Date.now() - 1).toISOString(),
        ...(expired ? { expiresAt: new Date(Date.now() - 1).toISOString() } : {}),
      });
      const onSignedIn = vi.fn();
      render(
        wrap(<OtpScreen onSignedIn={onSignedIn} onChangeNumber={vi.fn()} onMissingChallenge={vi.fn()} />),
      );
      await user.click(screen.getByRole('button', { name: expired ? 'دریافت کد جدید' : 'ارسال دوباره کد' }));
      await waitFor(() => expect(module.challenges.load()?.requestId).not.toBe(original.requestId));
      expect(screen.getByRole('button', { name: 'ارسال دوباره کد' })).toBeDisabled();
      expect(screen.getByLabelText(/کد ورود/)).toHaveValue('');
      await user.type(screen.getByLabelText(/کد ورود/), FIXTURE.otpCode);
      await user.click(screen.getByRole('button', { name: 'تأیید و ورود' }));
      await waitFor(() => expect(onSignedIn).toHaveBeenCalled());
    },
  );

  it('shows the send-failed recovery after resend and allows a successful retry', async () => {
    const user = userEvent.setup();
    const { wrap, module } = setup();
    const original = await module.gateway.requestOtp(FIXTURE.ownerMobile);
    mock.db.state.otps.find((otp) => otp.requestId === original.requestId)!.resendAt = Date.now() - 1;
    module.challenges.save({ ...original, resendAvailableAt: new Date(Date.now() - 1).toISOString() });
    mock.server.use(
      http.post(
        `${BASE}/api/v1/auth/otp/request`,
        () =>
          HttpResponse.json(
            {
              status: 503,
              code: 'OTP_SEND_FAILED',
              title: 'ارسال پیامک ناموفق بود',
            },
            { status: 503 },
          ),
        { once: true },
      ),
    );
    render(wrap(<OtpScreen onSignedIn={vi.fn()} onChangeNumber={vi.fn()} onMissingChallenge={vi.fn()} />));
    await user.click(screen.getByRole('button', { name: 'ارسال دوباره کد' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('کد ارسال نشد');
    expect(screen.queryByLabelText(/کد ورود/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'تلاش دوباره' }));
    await waitFor(() => expect(module.challenges.load()?.requestId).not.toBe(original.requestId));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/کد ورود/)).toBeInTheDocument();
  });

  it('requests a code, verifies it and signs in (AUTH-01 → AUTH-02)', async () => {
    const user = userEvent.setup();
    const { wrap, session } = setup();
    const onCodeSent = vi.fn();
    const login = render(wrap(<LoginScreen onCodeSent={onCodeSent} />));
    await user.type(screen.getByLabelText(/شماره موبایل/), '۰۹۱۲۳۴۵۶۷۸۹');
    await user.click(screen.getByRole('button', { name: 'دریافت کد ورود' }));
    await waitFor(() => expect(onCodeSent).toHaveBeenCalled());
    login.unmount();

    const onSignedIn = vi.fn();
    render(wrap(<OtpScreen onSignedIn={onSignedIn} onChangeNumber={vi.fn()} onMissingChallenge={vi.fn()} />));
    expect(screen.getByText(/کد به ۰۹۱۲۳۴۵۶۷۸۹ ارسال شد/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ارسال دوباره کد' })).toBeDisabled();
    await user.type(screen.getByLabelText(/کد ورود/), FIXTURE.otpCode);
    await user.click(screen.getByRole('button', { name: 'تأیید و ورود' }));
    await waitFor(() =>
      expect(onSignedIn).toHaveBeenCalledWith(expect.objectContaining({ isNewUser: false })),
    );
    expect(session.getState()).toMatchObject({ status: 'signed-in', user: { mobile: FIXTURE.ownerMobile } });
  });

  it('shows the otp-wrong state with the server message', async () => {
    const user = userEvent.setup();
    const { wrap, module } = setup();
    module.challenges.save(await module.gateway.requestOtp(FIXTURE.ownerMobile));
    render(wrap(<OtpScreen onSignedIn={vi.fn()} onChangeNumber={vi.fn()} onMissingChallenge={vi.fn()} />));
    await user.type(screen.getByLabelText(/کد ورود/), '000000');
    await user.click(screen.getByRole('button', { name: 'تأیید و ورود' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('۴ تلاش دیگر باقی است');
    expect(screen.getByRole('button', { name: 'اصلاح کد' })).toBeInTheDocument();
    expect(screen.getByText('کد واردشده درست نیست. دوباره تلاش کنید.')).toBeInTheDocument();
  });

  it('rejects a malformed mobile before calling the API', async () => {
    const user = userEvent.setup();
    const { wrap } = setup();
    const onCodeSent = vi.fn();
    render(wrap(<LoginScreen onCodeSent={onCodeSent} />));
    // pristine: not red; the CTA stays disabled while the number is invalid (AUTH-01-ERROR 405:6105)
    expect(screen.getByLabelText(/شماره موبایل/)).not.toHaveAttribute('aria-invalid', 'true');
    await user.type(screen.getByLabelText(/شماره موبایل/), '0812345678');
    expect(await screen.findByText('شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'دریافت کد ورود' })).toBeDisabled();
    expect(screen.getByLabelText(/شماره موبایل/)).toHaveAttribute('aria-invalid', 'true');
    expect(onCodeSent).not.toHaveBeenCalled();
  });

  it('«تغییر شماره» drops the challenge and brings the number back editable', async () => {
    const user = userEvent.setup();
    const { wrap, module } = setup();
    module.challenges.save(await module.gateway.requestOtp(FIXTURE.ownerMobile));
    const onChangeNumber = vi.fn();
    const otp = render(
      wrap(<OtpScreen onSignedIn={vi.fn()} onChangeNumber={onChangeNumber} onMissingChallenge={vi.fn()} />),
    );
    await user.click(screen.getByRole('button', { name: 'تغییر شماره' }));
    expect(onChangeNumber).toHaveBeenCalled();
    expect(module.challenges.load()).toBeNull();
    otp.unmount();

    render(wrap(<LoginScreen onCodeSent={vi.fn()} />));
    expect(screen.getByLabelText(/شماره موبایل/)).toHaveValue(toPersianDigits(FIXTURE.ownerMobile));
  });

  it('shows the server wait of OTP_RATE_LIMITED and keeps the CTA disabled meanwhile', async () => {
    const user = userEvent.setup();
    const { wrap, module } = setup();
    await module.gateway.requestOtp(FIXTURE.ownerMobile); // the mock's resend cooldown: 60 s
    const onCodeSent = vi.fn();
    render(wrap(<LoginScreen defaultMobile={FIXTURE.ownerMobile} onCodeSent={onCodeSent} />));
    const cta = screen.getByRole('button', { name: 'دریافت کد ورود' });
    await waitFor(() => expect(cta).toBeEnabled());
    await user.click(cta);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('کمی صبر کنید');
    expect(alert).toHaveTextContent(/تا ۰[۰۱]:[۰-۹]{2} دیگر دوباره تلاش کنید/);
    expect(cta).toBeDisabled();
    expect(onCodeSent).not.toHaveBeenCalled();
  });

  it('shows otp-send-failed (503) and keeps the number', async () => {
    const user = userEvent.setup();
    const { wrap } = setup();
    render(wrap(<LoginScreen onCodeSent={vi.fn()} />));
    await user.type(screen.getByLabelText(/شماره موبایل/), SEND_FAILED_MOBILE);
    await user.click(screen.getByRole('button', { name: 'دریافت کد ورود' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('ارسال پیامک انجام نشد');
    expect(screen.getByLabelText(/شماره موبایل/)).toHaveValue(toPersianDigits(SEND_FAILED_MOBILE));
  });

  it('after five wrong codes the right one no longer signs in (otp-limited from verify)', async () => {
    const user = userEvent.setup();
    const { wrap, module } = setup();
    module.challenges.save(await module.gateway.requestOtp(FIXTURE.ownerMobile));
    const onSignedIn = vi.fn();
    render(wrap(<OtpScreen onSignedIn={onSignedIn} onChangeNumber={vi.fn()} onMissingChallenge={vi.fn()} />));
    for (let i = 0; i < 5; i++) {
      await user.clear(screen.getByLabelText(/کد ورود/));
      await user.type(screen.getByLabelText(/کد ورود/), '000000');
      await user.click(screen.getByRole('button', { name: 'تأیید و ورود' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'اصلاح کد' })).toBeEnabled());
    }
    await user.clear(screen.getByLabelText(/کد ورود/));
    await user.type(screen.getByLabelText(/کد ورود/), FIXTURE.otpCode);
    await user.click(screen.getByRole('button', { name: 'تأیید و ورود' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('کمی صبر کنید');
    expect(onSignedIn).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/کد ورود/)).not.toBeInTheDocument();
  });

  it('correcting 08… to 09… clears the error at once and enables the CTA (AUTH-VALIDATION)', async () => {
    const user = userEvent.setup();
    const { wrap } = setup();
    render(wrap(<LoginScreen onCodeSent={vi.fn()} />));
    const field = screen.getByLabelText(/شماره موبایل/);
    const cta = screen.getByRole('button', { name: 'دریافت کد ورود' });
    await user.type(field, '08123456789');
    expect(await screen.findByText('شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.')).toBeInTheDocument();
    expect(cta).toBeDisabled();
    await user.clear(field);
    await user.type(field, '09123456789');
    await waitFor(() => expect(cta).toBeEnabled());
    expect(screen.queryByText('شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.')).not.toBeInTheDocument();
    expect(field).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('a malformed OTP never reaches the server (1e5, -12345, 12a345)', async () => {
    const user = userEvent.setup();
    const { wrap, module } = setup();
    module.challenges.save(await module.gateway.requestOtp(FIXTURE.ownerMobile));
    render(wrap(<OtpScreen onSignedIn={vi.fn()} onChangeNumber={vi.fn()} onMissingChallenge={vi.fn()} />));
    const field = screen.getByLabelText(/کد ورود/);
    for (const raw of ['1e5', '-12345', '12a345', '123']) {
      await user.clear(field);
      await user.type(field, raw);
      expect(screen.getByRole('button', { name: 'تأیید و ورود' })).toBeDisabled();
    }
  });

  it('customer layout follows Figma 20b (310:379 / 310:396): header, cards, «اصلاح شماره» and «بازگشت»', async () => {
    const user = userEvent.setup();
    const { wrap } = setup('cards');
    const login = render(wrap(<LoginScreen onCodeSent={vi.fn()} />));
    expect(screen.getByRole('heading', { name: 'ورود به حساب مشتری' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'شمارهٔ همراه شما' })).toBeInTheDocument();
    expect(screen.getByText('کد ورود به همین شماره پیامک می‌شود.')).toBeInTheDocument();
    expect(screen.queryByText(/شرایط استفاده/)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/شماره موبایل/), FIXTURE.ownerMobile);
    await user.click(screen.getByRole('button', { name: 'دریافت کد ورود' }));
    await screen.findByText('دریافت کد ورود');
    login.unmount();

    render(wrap(<OtpScreen onSignedIn={vi.fn()} onChangeNumber={vi.fn()} onMissingChallenge={vi.fn()} />));
    expect(screen.getByRole('heading', { name: 'تأیید شماره همراه' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'کد ورود' })).toBeInTheDocument();
    expect(screen.getByText(`شماره: ${toPersianDigits(FIXTURE.ownerMobile)}`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ارسال دوباره تا/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'اصلاح شماره' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'بازگشت' })).toBeInTheDocument();
  });

  it('never shows the Development code when the app does not allow it (F01-S16)', async () => {
    const { wrap, module } = setup('split', false);
    module.challenges.save(await module.gateway.requestOtp(FIXTURE.ownerMobile));
    render(wrap(<OtpScreen onSignedIn={vi.fn()} onChangeNumber={vi.fn()} onMissingChallenge={vi.fn()} />));
    expect(screen.getByLabelText(/کد ورود/)).toBeInTheDocument();
    expect(screen.queryByText(/کد آزمایشی/)).not.toBeInTheDocument();
  });
});
