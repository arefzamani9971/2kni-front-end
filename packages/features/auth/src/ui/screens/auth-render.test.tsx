import { render } from '@dukani/i18n/testing';
import { act, screen } from '@testing-library/react';
import { DataProvider, createDataClient } from '@dukani/data';
import { compose, createApi, createFetchAdapter, withErrorMapping, withIdempotency } from '@dukani/http';
import { createMemorySession, createMemoryStorage } from '@dukani/platform';
import { FIXTURE } from '@dukani/testing';
import { ToastProvider } from '@dukani/ui-kit';
import type * as UiKit from '@dukani/ui-kit';
import type { ComponentProps, ReactNode } from 'react';
import { AuthModuleProvider, createAuthModule } from '../../module';
import { LoginScreen } from './LoginScreen';
import { OtpScreen } from './OtpScreen';

// Count renders of the input fields: the clock must not re-render them (PAT-FORM-01 / performance checklist).
const renders = vi.hoisted(() => ({ mobile: 0, otp: 0 }));
vi.mock('@dukani/ui-kit', async (importOriginal) => {
  const kit = await importOriginal<typeof UiKit>();
  return {
    ...kit,
    IranMobileField: (props: ComponentProps<typeof kit.IranMobileField>) => {
      renders.mobile++;
      return <kit.IranMobileField {...props} />;
    },
    OtpField: (props: ComponentProps<typeof kit.OtpField>) => {
      renders.otp++;
      return <kit.OtpField {...props} />;
    },
  };
});

/** One act per second, as the browser commits each tick separately. */
const tick = (seconds: number) => {
  for (let i = 0; i < seconds; i++) act(() => vi.advanceTimersByTime(1000));
};

const setup = () => {
  const http = compose(createFetchAdapter({ baseUrl: 'http://api.test' }), withIdempotency, withErrorMapping);
  const module = createAuthModule({
    mode: 'mock',
    api: createApi(http),
    sameOriginHttp: http,
    session: createMemorySession(createMemoryStorage()),
    storage: createMemoryStorage(),
    layout: 'split',
    showDevCode: false,
  });
  const wrap = (ui: ReactNode) => (
    <DataProvider client={createDataClient()}>
      <ToastProvider>
        <AuthModuleProvider value={module}>{ui}</AuthModuleProvider>
      </ToastProvider>
    </DataProvider>
  );
  return { module, wrap };
};

describe('auth screens do not re-render on the clock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    renders.mobile = 0;
    renders.otp = 0;
  });
  afterEach(() => vi.useRealTimers());

  it('login: an idle screen without a server wait renders the field once', () => {
    const { wrap } = setup();
    render(wrap(<LoginScreen onCodeSent={vi.fn()} />));
    const afterMount = renders.mobile;
    tick(5);
    expect(renders.mobile).toBe(afterMount);
  });

  it('otp: the resend countdown ticks in its leaf; the code field re-renders once, at the deadline', () => {
    const { wrap, module } = setup();
    const now = Date.now();
    module.challenges.save({
      requestId: '0199b620-4f5a-7000-8000-0000000000aa',
      mobile: FIXTURE.ownerMobile,
      mobileMasked: '0912***6789',
      expiresAt: new Date(now + 120_000).toISOString(),
      resendAvailableAt: new Date(now + 60_000).toISOString(),
      codeLength: 6,
    });
    render(wrap(<OtpScreen onSignedIn={vi.fn()} onChangeNumber={vi.fn()} onMissingChallenge={vi.fn()} />));
    expect(screen.getByText('ارسال دوباره تا ۰۱:۰۰ دیگر')).toBeInTheDocument();
    const resend = screen.getByRole('button', { name: 'ارسال دوباره کد' });
    expect(resend).toBeDisabled();
    const afterMount = renders.otp;

    tick(3);
    expect(screen.getByText('ارسال دوباره تا ۰۰:۵۷ دیگر')).toBeInTheDocument();
    expect(renders.otp).toBe(afterMount);

    tick(57);
    expect(screen.getByText('اگر کد نرسید، دوباره درخواست کنید.')).toBeInTheDocument();
    expect(resend).toBeEnabled();
    expect(renders.otp).toBe(afterMount + 1);
  });
});
