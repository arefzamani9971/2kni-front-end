'use client';
import { isAppError } from '@dukani/domain';
import { useAppForm } from '@dukani/forms';
import { useOnlineStatus } from '@dukani/platform';
import { AuthShell, Button, IranMobileField } from '@dukani/ui-kit';
import { useState } from 'react';

import { limitedMessage, otpProblemOf, retryDeadline } from '../../domain/otp-challenge';
import { OTP_PROBLEM_COPY } from '../../domain/otp-challenge.constants';
import { useAuthModule } from '../../module';
import { useNow } from '../hooks/use-now';
import { useRequestOtp } from '../hooks/use-request-otp';
import { AUTH_COPY, CUSTOMER_CONTEXT, SELLER_AUTH_BRAND } from './auth-copy.constants';
import type { LoginScreenProps } from './LoginScreen.types';
import { schema } from './LoginScreen.schema';

/**
 * AUTH-01 (Figma 358:478 / desktop 358:5341) and AUTH-01-ERROR (405:6105): mobile number → SMS code.
 * No navigation before login (F01). The CTA is enabled only for a valid number, online and idle (F01 §4).
 */
export function LoginScreen({
  title,
  intro,
  context = CUSTOMER_CONTEXT,
  onBack,
  defaultMobile,
  onCodeSent,
}: LoginScreenProps) {
  const { challenges, layout } = useAuthModule();
  const copy = AUTH_COPY[layout];
  // after «تغییر شماره» the previous number comes back editable (F01 §7)
  const [initialMobile] = useState(() => defaultMobile ?? challenges.lastMobile() ?? '');
  const form = useAppForm({ schema, defaultValues: { mobile: initialMobile } });
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
    return { title: OTP_PROBLEM_COPY['send-failed'].title, description: error.message };
  })();

  return (
    <form noValidate onSubmit={submit} className="contents">
      <AuthShell
        {...(layout === 'split'
          ? { layout, back: copy.loginBack ? onBack : undefined, brand: SELLER_AUTH_BRAND }
          : { layout, subtitle: context, cardTitle: copy.loginCard })}
        title={title ?? copy.loginTitle}
        actions={
          <Button
            type="submit"
            block
            loading={request.isPending}
            disabled={!form.formState.isValid || !online || waitFor > 0}
          >
            دریافت کد ورود
          </Button>
        }
        introduction={intro ?? copy.loginLead}
        notice={alert ?? undefined}
        note={
          // TODO(F01): link «شرایط استفاده و حریم خصوصی» once the landing has those pages (no fake checkbox)
          copy.loginNote ? (
            <p>
              {copy.loginNote[0]}
              <br />
              {copy.loginNote[1]}
            </p>
          ) : undefined
        }
      >
        <form.Field name="mobile">
          {(f) => (
            <IranMobileField
              {...f}
              onChange={(v) => {
                f.onChange(v);
                // the limit and the send failure belong to the number that was sent
                if (request.error) {
                  request.reset();
                  setRetryAt(null);
                }
              }}
              autoFocus
            />
          )}
        </form.Field>
      </AuthShell>
    </form>
  );
}
