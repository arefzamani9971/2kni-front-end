import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider, createQueryClient } from '@dukani/data';
import { compose, createApi, createFetchAdapter, withErrorMapping, withIdempotency } from '@dukani/http';
import { createMemorySession, createMemoryStorage } from '@dukani/platform';
import { FIXTURE } from '@dukani/testing';
import { createMockServer } from '@dukani/testing/node';
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

const setup = () => {
  const http = compose(createFetchAdapter({ baseUrl: BASE }), withIdempotency, withErrorMapping);
  const storage = createMemoryStorage();
  const session = createMemorySession(createMemoryStorage());
  const module = createAuthModule({ mode: 'mock', api: createApi(http), sameOriginHttp: http, session, storage });
  const wrap = (ui: ReactNode) => (
    <DataProvider client={createQueryClient()}>
      <ToastProvider>
        <AuthModuleProvider value={module}>{ui}</AuthModuleProvider>
      </ToastProvider>
    </DataProvider>
  );
  return { module, session, wrap };
};

describe('auth flow against the mock backend', () => {
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
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(expect.objectContaining({ isNewUser: false })));
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
    expect(screen.getByText('کد واردشده درست نیست، دوباره تلاش کنید.')).toBeInTheDocument();
  });

  it('rejects a malformed mobile before calling the API', async () => {
    const user = userEvent.setup();
    const { wrap } = setup();
    const onCodeSent = vi.fn();
    render(wrap(<LoginScreen onCodeSent={onCodeSent} />));
    await user.type(screen.getByLabelText(/شماره موبایل/), '0912');
    await user.click(screen.getByRole('button', { name: 'دریافت کد ورود' }));
    expect(await screen.findByText('شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.')).toBeInTheDocument();
    expect(screen.getByLabelText(/شماره موبایل/)).toHaveAttribute('aria-invalid', 'true');
    expect(onCodeSent).not.toHaveBeenCalled();
  });
});
