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
import { useNow } from './use-now';
import { useRequestOtp } from './use-request-otp';
import type { UseLoginFlowOptions } from './use-login-flow.types';
/** Owns AUTH-01 submission, validation, and rate-limit recovery. */
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
  const now = useNow();
  const [retryAt, setRetryAt] = useState<number | null>(null);

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
  const waitFor = retryAt ? Math.max(0, Math.ceil((retryAt - now) / 1000)) : 0;
  const alert = (() => {
    if (!error) return null;
    if (problem === 'limited')
      return { title: OTP_PROBLEM_COPY.limited.title, description: limitedMessage(waitFor) };
    if (problem === 'blocked') return OTP_PROBLEM_COPY.blocked;
    if (problem === 'send-failed') return OTP_PROBLEM_COPY['send-failed'];
    return { title: OTP_PROBLEM_COPY['send-failed'].title, description: errorMessage(error) };
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
    disabled: !form.formState.isValid || !online || waitFor > 0,
  };
}
