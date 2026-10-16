'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useValidationRules } from '@dukani/forms';
import { useAuthTranslations } from '../i18n/use-auth-translations';
import { useAuthProblemCopy } from '../i18n/use-auth-problem-copy';
import { useLocale } from '@dukani/i18n';
import { isAppError, toPersianDigits, type AppError } from '@dukani/domain';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import { useOnlineStatus } from '@dukani/platform';
import { useToast } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';

import { otpProblemOf, retryDeadline } from '../../domain/otp-challenge';
import type { OtpChallenge } from '../../domain/otp-challenge.types';
import { useAuthModule } from '../../module';
import { schema } from '../screens/OtpScreen.schema';
import type { Problem } from '../screens/OtpScreen.types';
import { useDeadlinePassed } from './use-deadline-passed';
import { useRequestOtp } from './use-request-otp';
import { useVerifyOtp } from './use-verify-otp';
import type { AuthAlert } from './use-login-flow.types';
import type { OtpActionMode, OtpFlow, UseOtpFlowOptions } from './use-otp-flow.types';

/**
 * AUTH-02 behavior (F01 §7, AUTH-OTP): verify, resend (a new challenge replaces the old one), change number,
 * and the problem states otp-wrong / expired / limited / send-failed / blocked. The screen only renders it.
 * Returns null while there is no pending challenge (the caller is told through `onMissingChallenge`).
 * Deadlines (expiry, resend, server wait) re-render the screen once when reached; only the countdown texts tick.
 */
export const useOtpFlow = ({
  onSignedIn,
  onChangeNumber,
  onMissingChallenge,
}: UseOtpFlowOptions): OtpFlow | null => {
  const t = useAuthTranslations();
  const errorMessage = useAppErrorMessage();
  const locale = useLocale();
  const { problems: OTP_PROBLEM_COPY, limitedMessage } = useAuthProblemCopy();
  const { challenges, layout, showDevCode } = useAuthModule();
  const [challenge, setChallenge] = useState<OtpChallenge | null>(() => challenges.load());
  const [reported, setProblem] = useState<Problem | null>(null);
  const online = useOnlineStatus();
  const validationRules = useValidationRules();
  const form = useAppForm({ schema: schema(validationRules), defaultValues: { code: '' } });
  const verify = useVerifyOtp();
  const resend = useRequestOtp();
  const toast = useToast();

  // the code also expires on the client clock (otp-expired state without waiting for the server)
  const expired = useDeadlinePassed(challenge ? Date.parse(challenge.expiresAt) : null);
  const resendAt = challenge ? Date.parse(challenge.resendAvailableAt) : null;
  const resendReady = useDeadlinePassed(resendAt);
  // otp-limited: wait for the server's retryAfterSeconds, then a new code may be requested
  const limitedUntil = reported?.kind === 'limited' ? (reported.retryAt ?? null) : null;
  const limitedOver = useDeadlinePassed(limitedUntil);

  useEffect(() => {
    if (!challenge) onMissingChallenge();
  }, [challenge, onMissingChallenge]);

  if (!challenge || resendAt === null) return null;

  const problem: Problem | null = reported ?? (expired ? { kind: 'expired' } : null);

  const fail = (e: unknown) => {
    const error: AppError | null = isAppError(e) ? e : null;
    if (!error) return;
    if (error.kind === 'Offline' || error.kind === 'Unknown' || error.code === 'NETWORK') {
      // F01-S13: a lost connection keeps the challenge and the code; it is not a sign-out
      toast(errorMessage(error), 'danger');
      return;
    }
    const kind = otpProblemOf(error);
    if (kind === 'wrong') form.setFieldError('code', t('wrongCode'));
    setProblem({ kind, error, retryAt: kind === 'limited' ? retryDeadline(error) : null });
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
      toast(t('resent'), 'success');
    } catch (e) {
      fail(e);
    }
  };

  // «تغییر شماره»: the challenge is dropped, the login form keeps the number editable
  const changeNumber = () => {
    challenges.discard();
    onChangeNumber();
  };

  const blocking = !!problem && problem.kind !== 'wrong' && problem.kind !== 'other';
  const alert = ((): AuthAlert | null => {
    if (!problem) return null;
    if (problem.kind === 'other')
      return {
        title: t('failed'),
        description: problem.error ? errorMessage(problem.error) : undefined,
        waitUntil: null,
      };
    const copy = OTP_PROBLEM_COPY[problem.kind];
    if (problem.kind === 'limited')
      return limitedOver
        ? { title: copy.title, description: limitedMessage(0), waitUntil: null }
        : { title: copy.title, description: undefined, waitUntil: limitedUntil };
    // OTP_WRONG: the server message also says how many attempts are left
    if (problem.kind === 'wrong')
      return {
        title: copy.title,
        description: problem.error ? errorMessage(problem.error) : copy.description,
        waitUntil: null,
      };
    return { title: copy.title, description: copy.description, waitUntil: null };
  })();

  const mode: OtpActionMode = (() => {
    if (problem?.kind === 'send-failed') return 'retry-send';
    // limited: only «تغییر شماره» while the server wait runs (Figma 394:6076); a new code once it is over
    if (problem?.kind === 'expired' || (problem?.kind === 'limited' && limitedOver)) return 'new-code';
    if (problem?.kind === 'limited' || problem?.kind === 'blocked') return 'change-only';
    if (problem?.kind === 'wrong') return 'fix';
    return 'confirm';
  })();

  return {
    layout,
    challenge,
    form,
    problem,
    blocking,
    alert,
    mode,
    mobile: locale === 'fa' ? toPersianDigits(challenge.mobile) : challenge.mobile,
    // F01-S16: the backend sends devCode only in Development, and the app decides whether it may be shown
    devCode: showDevCode ? (challenge.devCode ?? null) : null,
    resendAt,
    resendReady,
    online,
    verifying: verify.isPending,
    resending: resend.isPending,
    submit,
    sendAgain,
    changeNumber,
    onCodeEdited: () => {
      if (problem?.kind === 'wrong') setProblem(null);
    },
  };
};
