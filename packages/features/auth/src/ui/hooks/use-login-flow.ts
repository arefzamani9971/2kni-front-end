'use client';
import { isAppError } from '@dukani/domain';
import { useLocalizedAppForm as useAppForm, useValidationRules } from '@dukani/forms';
import { useOnlineStatus } from '@dukani/platform';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useState } from 'react';
import { otpProblemOf, retryDeadline } from '../../domain/otp-challenge';
import { useAuthModule } from '../../module';
import { useAuthProblemCopy } from '../i18n/use-auth-problem-copy';
import { schema } from '../screens/LoginScreen.schema';
import { useDeadlinePassed } from './use-deadline-passed';
import { useRequestOtp } from './use-request-otp';
import type { AuthAlert, UseLoginFlowOptions } from './use-login-flow.types';
/**
 * Owns AUTH-01 submission, validation, and rate-limit recovery. The screen does not tick: only the wait text of
 * OTP_RATE_LIMITED counts down (`RetryWait`), and validity is read by the CTA leaf (`form.Status`).
 */
export function useLoginFlow({ defaultMobile, onCodeSent }: UseLoginFlowOptions) {
  const errorMessage = useAppErrorMessage();
  const { problems: OTP_PROBLEM_COPY, limitedMessage } = useAuthProblemCopy();
  const { challenges } = useAuthModule();
  // after «تغییر شماره» the previous number comes back editable (F01 §7)
  const [initialMobile] = useState(() => defaultMobile ?? challenges.lastMobile() ?? '');
  const validationRules = useValidationRules();
  const form = useAppForm({ schema: schema(validationRules), defaultValues: { mobile: initialMobile } });
  const request = useRequestOtp();
  const online = useOnlineStatus();
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const waitOver = useDeadlinePassed(retryAt);

  const submit = form.handleSubmit(async ({ mobile }) => {
    try {
      onCodeSent(await request.mutateAsync(mobile));
    } catch (e) {
      if (!isAppError(e)) return;
      form.applyServerError(e);
      setRetryAt(otpProblemOf(e) === 'limited' ? retryDeadline(e) : null);
    }
  });

  const error = request.error && !request.error.fieldErrors ? request.error : null;
  const problem = error ? otpProblemOf(error) : null;
  const alert = ((): AuthAlert | null => {
    if (!error) return null;
    if (problem === 'limited')
      return waitOver
        ? { title: OTP_PROBLEM_COPY.limited.title, description: limitedMessage(0), waitUntil: null }
        : { title: OTP_PROBLEM_COPY.limited.title, description: undefined, waitUntil: retryAt };
    if (problem === 'blocked') return { ...OTP_PROBLEM_COPY.blocked, waitUntil: null };
    if (problem === 'send-failed') return { ...OTP_PROBLEM_COPY['send-failed'], waitUntil: null };
    return {
      title: OTP_PROBLEM_COPY['send-failed'].title,
      description: errorMessage(error),
      waitUntil: null,
    };
  })();

  const clearSubmissionError = () => {
    if (request.error) {
      request.reset();
      setRetryAt(null);
    }
  };
  return {
    form,
    submit,
    alert,
    clearSubmissionError,
    loading: request.isPending,
    /** Besides an invalid number (read in the CTA leaf): offline or the server wait is still running. */
    blocked: !online || !waitOver,
  };
}
