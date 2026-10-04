'use client';
import { isAppError, OTP_MESSAGES, toPersianDigits, type AppError } from '@dukani/domain';
import { useAppForm } from '@dukani/forms';
import { useOnlineStatus } from '@dukani/platform';
import { useToast } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';

import { limitedMessage, otpProblemOf, retryDeadline, secondsUntil } from '../../domain/otp-challenge';
import { OTP_PROBLEM_COPY } from '../../domain/otp-challenge.constants';
import type { OtpChallenge } from '../../domain/otp-challenge.types';
import { useAuthModule } from '../../module';
import { schema } from '../screens/OtpScreen.schema';
import type { Problem } from '../screens/OtpScreen.types';
import { useNow } from './use-now';
import { useRequestOtp } from './use-request-otp';
import { useVerifyOtp } from './use-verify-otp';
import type { OtpActionMode, OtpFlow, UseOtpFlowOptions } from './use-otp-flow.types';

/**
 * AUTH-02 behavior (F01 §7, AUTH-OTP): verify, resend (a new challenge replaces the old one), change number,
 * and the problem states otp-wrong / expired / limited / send-failed / blocked. The screen only renders it.
 * Returns null while there is no pending challenge (the caller is told through `onMissingChallenge`).
 */
export const useOtpFlow = ({ onSignedIn, onChangeNumber, onMissingChallenge }: UseOtpFlowOptions): OtpFlow | null => {
  const { challenges, layout, showDevCode } = useAuthModule();
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

  if (!challenge) return null;

  // the code also expires on the client clock (otp-expired state without waiting for the server)
  const expired = secondsUntil(challenge.expiresAt, now) === 0;
  const problem: Problem | null = reported ?? (expired ? { kind: 'expired' } : null);
  // otp-limited: wait for the server's retryAfterSeconds, then a new code may be requested
  const limitedFor =
    problem?.kind === 'limited' && problem.retryAt ? Math.max(0, Math.ceil((problem.retryAt - now) / 1000)) : 0;

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

  const blocking = !!problem && problem.kind !== 'wrong' && problem.kind !== 'other';
  const alert = (() => {
    if (!problem) return null;
    if (problem.kind === 'other') return { title: 'ورود انجام نشد', description: problem.message };
    const copy = OTP_PROBLEM_COPY[problem.kind];
    if (problem.kind === 'limited') return { title: copy.title, description: limitedMessage(limitedFor) };
    // OTP_WRONG: the server message also says how many attempts are left
    if (problem.kind === 'wrong') return { title: copy.title, description: problem.message ?? copy.description };
    return { title: copy.title, description: copy.description };
  })();

  const mode: OtpActionMode = (() => {
    if (problem?.kind === 'send-failed') return 'retry-send';
    // limited: only «تغییر شماره» while the server wait runs (Figma 394:6076); a new code once it is over
    if (problem?.kind === 'expired' || (problem?.kind === 'limited' && limitedFor === 0)) return 'new-code';
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
    mobile: toPersianDigits(challenge.mobile),
    // F01-S16: the backend sends devCode only in Development, and the app decides whether it may be shown
    devCode: showDevCode ? (challenge.devCode ?? null) : null,
    resendIn: secondsUntil(challenge.resendAvailableAt, now),
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
