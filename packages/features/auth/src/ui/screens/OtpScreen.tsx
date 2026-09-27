'use client';
import { isAppError, toPersianDigits, type AppError } from '@dukani/domain';
import { rules, s, useAppForm } from '@dukani/forms';
import { Alert, AuthShell, Button, OtpField, useToast } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import type { VerifiedSession } from '../../application/ports';
import { formatCountdown, OTP_PROBLEM_COPY, otpProblemOf, secondsUntil, type OtpChallenge, type OtpProblem } from '../../domain/otp-challenge';
import { useAuthModule } from '../../module';
import { useRequestOtp, useVerifyOtp } from '../hooks/use-auth';
import { useNow } from '../hooks/use-now';

const schema = s.object({ code: rules.otp() });

type Problem = { readonly kind: OtpProblem; readonly message?: string };

export type OtpScreenProps = {
  readonly onSignedIn: (result: VerifiedSession) => void;
  readonly onChangeNumber: () => void;
  /** No pending challenge (direct visit or expired tab): usually back to the login page. */
  readonly onMissingChallenge: () => void;
};

/**
 * AUTH-02 (Figma 358:479) and its states: otp-wrong (394:6038), otp-expired (394:6059),
 * otp-limited (394:6076), otp-send-failed (394:6091), AUTH-02-ERROR (405:6128), plus USER_BLOCKED.
 */
export function OtpScreen({ onSignedIn, onChangeNumber, onMissingChallenge }: OtpScreenProps) {
  const { challenges } = useAuthModule();
  const [challenge, setChallenge] = useState<OtpChallenge | null>(() => challenges.load());
  const [reported, setProblem] = useState<Problem | null>(null);
  const now = useNow();
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

  const fail = (e: unknown) => {
    const error: AppError | null = isAppError(e) ? e : null;
    if (!error) return;
    const kind = otpProblemOf(error);
    if (kind === 'wrong') form.setFieldError('code', 'کد واردشده درست نیست، دوباره تلاش کنید.');
    setProblem({ kind, message: error.message });
  };

  const submit = form.handleSubmit(async ({ code }) => {
    try {
      onSignedIn(await verify.mutateAsync({ challenge, code }));
    } catch (e) {
      fail(e);
    }
  });

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

  const blocking = problem && problem.kind !== 'wrong' && problem.kind !== 'other' ? problem.kind : null;
  const copy = problem && problem.kind !== 'other' ? OTP_PROBLEM_COPY[problem.kind] : null;
  const changeNumber = (
    <Button type="button" variant="secondary" block onClick={onChangeNumber}>
      تغییر شماره
    </Button>
  );

  const actions = (() => {
    if (blocking === 'expired' || blocking === 'send-failed')
      return (
        <div className="flex flex-col gap-3">
          <Button type="button" block loading={resend.isPending} onClick={sendAgain}>
            {blocking === 'expired' ? 'دریافت کد تازه' : 'تلاش دوباره'}
          </Button>
          {changeNumber}
        </div>
      );
    if (blocking === 'limited' || blocking === 'blocked')
      return (
        <Button type="button" block onClick={onChangeNumber}>
          تغییر شماره
        </Button>
      );
    if (problem?.kind === 'wrong')
      return (
        <div className="flex flex-col gap-3">
          <Button type="submit" block loading={verify.isPending}>
            اصلاح کد
          </Button>
          {changeNumber}
        </div>
      );
    return (
      <Button type="submit" block loading={verify.isPending}>
        تأیید و ورود
      </Button>
    );
  })();

  return (
    <form noValidate onSubmit={submit} className="contents">
      <AuthShell title={copy && problem?.kind !== 'other' ? copy.title : 'تأیید شماره موبایل'} back={onChangeNumber} actions={actions}>
        {copy ? <Alert title={copy.title} description={problem?.message ?? copy.description} /> : null}
        {problem?.kind === 'other' ? <Alert title="ورود انجام نشد" description={problem.message} /> : null}
        {problem ? (
          <p className="text-body-m text-fg-secondary">شماره موبایل: {mobile}</p>
        ) : (
          <p className="text-body-m text-fg-secondary">کد به {mobile} ارسال شد.</p>
        )}
        {blocking ? null : (
          <>
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
                  hint={challenge.devCode ? `کد آزمایشی: ${toPersianDigits(challenge.devCode)}` : undefined}
                />
              )}
            </form.Field>
            {problem ? null : (
              <>
                <p className="text-body-m text-fg-secondary" aria-live="polite">
                  {resendIn > 0 ? `ارسال دوباره تا ${formatCountdown(resendIn)} دیگر` : 'اگر کد نرسید، دوباره درخواست کنید.'}
                </p>
                {changeNumber}
                <Button type="button" variant="secondary" block disabled={resendIn > 0} loading={resend.isPending} onClick={sendAgain}>
                  ارسال دوباره کد
                </Button>
              </>
            )}
          </>
        )}
      </AuthShell>
    </form>
  );
}
