'use client';
import { isAppError, OTP_MESSAGES, toPersianDigits, type AppError } from '@dukani/domain';
import { useAppForm } from '@dukani/forms';
import { useOnlineStatus } from '@dukani/platform';
import { Alert, AuthShell, Button, OtpField, useToast } from '@dukani/ui-kit';
import { useEffect, useState, type ReactNode } from 'react';

import { formatCountdown, limitedMessage, otpProblemOf, retryDeadline, secondsUntil } from '../../domain/otp-challenge';
import { OTP_PROBLEM_COPY } from '../../domain/otp-challenge.constants';
import type { OtpChallenge } from '../../domain/otp-challenge.types';
import { useAuthModule } from '../../module';
import { useRequestOtp } from '../hooks/use-request-otp';
import { useVerifyOtp } from '../hooks/use-verify-otp';
import { useNow } from '../hooks/use-now';
import type { OtpScreenProps, Problem } from './OtpScreen.types';
import { schema } from './OtpScreen.schema';

/**
 * AUTH-02 (Figma 358:479 / desktop 358:5342) and its states: otp-wrong (394:6038), otp-expired (394:6059),
 * otp-limited (394:6076), otp-send-failed (394:6091), AUTH-02-ERROR (405:6128), plus USER_BLOCKED.
 */
export function OtpScreen({ onSignedIn, onChangeNumber, onMissingChallenge }: OtpScreenProps) {
  const { challenges } = useAuthModule();
  const [challenge, setChallenge] = useState<OtpChallenge | null>(() => challenges.load());
  const [reported, setProblem] = useState<Problem | null>(null);
  const now = useNow();
  const online = useOnlineStatus();
  const form = useAppForm({ schema, defaultValues: { code: '' } });
  const verify = useVerifyOtp();
  const resend = useRequestOtp();
  const toast = useToast();

  useEffect(() => {
    if (!challenge) onMissingChallenge();
  }, [challenge, onMissingChallenge]);

  // the code also expires on the client clock (otp-expired state without waiting for the server)
  const expired = challenge ? secondsUntil(challenge.expiresAt, now) === 0 : false;
  const problem: Problem | null = reported ?? (expired ? { kind: 'expired' } : null);

  if (!challenge) return null;
  const resendIn = secondsUntil(challenge.resendAvailableAt, now);
  const mobile = toPersianDigits(challenge.mobile);
  // F01-S16: the backend sends devCode only in Development; a production build never shows it
  const devCode = process.env.NODE_ENV === 'production' ? null : challenge.devCode;
  // otp-limited: wait for the server's retryAfterSeconds, then a new code may be requested
  const limitedFor = problem?.kind === 'limited' && problem.retryAt ? Math.max(0, Math.ceil((problem.retryAt - now) / 1000)) : 0;

  const fail = (e: unknown) => {
    const error: AppError | null = isAppError(e) ? e : null;
    if (!error) return;
    if (error.kind === 'Offline' || error.kind === 'Unknown' || error.code === 'NETWORK') {
      // F01-S13: a lost connection keeps the challenge and the code; it is not a sign-out
      toast(error.message, 'danger');
      return;
    }
    const kind = otpProblemOf(error);
    if (kind === 'wrong') form.setFieldError('code', OTP_MESSAGES.wrong);
    setProblem({ kind, message: error.message, retryAt: kind === 'limited' ? retryDeadline(error) : null });
  };

  const submit = form.handleSubmit(async ({ code }) => {
    try {
      onSignedIn(await verify.mutateAsync({ challenge, code }));
    } catch (e) {
      fail(e);
    }
  });

  // resend replaces the challenge completely: new requestId, timers, no old code or error (F01 §7)
  const sendAgain = async () => {
    try {
      const next = await resend.mutateAsync(challenge.mobile);
      setChallenge(next);
      setProblem(null);
      form.reset({ code: '' });
      toast('کد تازه ارسال شد.', 'success');
    } catch (e) {
      fail(e);
    }
  };

  // «تغییر شماره»: the challenge is dropped, the login form keeps the number editable
  const changeNumber = () => {
    challenges.discard();
    onChangeNumber();
  };

  const blocking = problem && problem.kind !== 'wrong' && problem.kind !== 'other' ? problem.kind : null;
  const copy = problem && problem.kind !== 'other' ? OTP_PROBLEM_COPY[problem.kind] : null;
  const description = (() => {
    if (!problem || !copy) return null;
    if (problem.kind === 'limited') return limitedMessage(limitedFor);
    // OTP_WRONG: the server message also says how many attempts are left
    if (problem.kind === 'wrong') return problem.message ?? copy.description;
    return copy.description;
  })();
  const changeNumberButton = (primary = false) => (
    <Button type="button" variant={primary ? 'primary' : 'secondary'} block onClick={changeNumber}>
      تغییر شماره
    </Button>
  );
  // StickyActionBar stacks them on mobile and puts them in one row on desktop (primary first)
  const pair = (main: ReactNode) => (
    <>
      {main}
      {changeNumberButton()}
    </>
  );

  const actions = (() => {
    // limited: only «تغییر شماره» while the server wait runs (Figma 394:6076); a new code once it is over
    const newCode = blocking === 'expired' || blocking === 'send-failed' || (blocking === 'limited' && limitedFor === 0);
    if (newCode)
      return pair(
        <Button type="button" block loading={resend.isPending} disabled={!online} onClick={sendAgain}>
          {blocking === 'send-failed' ? 'تلاش دوباره' : 'دریافت کد جدید'}
        </Button>,
      );
    if (blocking === 'limited' || blocking === 'blocked') return changeNumberButton(true);
    if (problem?.kind === 'wrong')
      return pair(
        <Button type="submit" block loading={verify.isPending} disabled={!online}>
          اصلاح کد
        </Button>,
      );
    return (
      <Button type="submit" block loading={verify.isPending} disabled={!form.formState.isValid || !online}>
        تأیید و ورود
      </Button>
    );
  })();

  return (
    <form noValidate onSubmit={submit} className="contents">
      <AuthShell
        title={copy ? copy.title : 'تأیید شماره موبایل'}
        back={changeNumber}
        actions={actions}
        lead={problem ? undefined : <p>کد به {mobile} ارسال شد.</p>}
        note={
          problem ? undefined : (
            <p aria-live="polite">
              {resendIn > 0 ? `ارسال دوباره تا ${formatCountdown(resendIn)} دیگر` : 'اگر کد نرسید، دوباره درخواست کنید.'}
            </p>
          )
        }
        footer={
          problem ? undefined : (
            <>
              {changeNumberButton()}
              <Button
                type="button"
                variant="secondary"
                block
                disabled={resendIn > 0 || !online}
                loading={resend.isPending}
                onClick={sendAgain}
              >
                ارسال دوباره کد
              </Button>
            </>
          )
        }
      >
        {copy ? <Alert title={copy.title} description={description} /> : null}
        {problem?.kind === 'other' ? <Alert title="ورود انجام نشد" description={problem.message} /> : null}
        {problem ? <p className="text-body-m text-fg-secondary">شماره موبایل: {mobile}</p> : null}
        {blocking ? null : (
          <form.Field name="code">
            {(f) => (
              <OtpField
                {...f}
                onChange={(v) => {
                  f.onChange(v);
                  if (problem?.kind === 'wrong') setProblem(null);
                }}
                label={`کد ورود ${toPersianDigits(String(challenge.codeLength))} رقمی`}
                autoFocus
                hint={devCode ? `کد آزمایشی: ${toPersianDigits(devCode)}` : undefined}
              />
            )}
          </form.Field>
        )}
      </AuthShell>
    </form>
  );
}
