'use client';
import { isAppError } from '@dukani/domain';
import { useAppForm } from '@dukani/forms';
import { Alert, AuthShell, Button, IranMobileField } from '@dukani/ui-kit';

import { useRequestOtp } from '../hooks/use-request-otp';
import type { LoginScreenProps } from './LoginScreen.types';
import { schema } from './LoginScreen.schema';

/** AUTH-01 (Figma 358:478): mobile number → SMS code. No navigation before login (F01). */
export function LoginScreen({
  title = 'ورود به دکانی',
  intro = 'فروش، موجودی و حساب مشتریان فروشگاه شما',
  onBack,
  defaultMobile = '',
  onCodeSent,
}: LoginScreenProps) {
  const form = useAppForm({ schema, defaultValues: { mobile: defaultMobile } });
  const request = useRequestOtp();
  const submit = form.handleSubmit(async ({ mobile }) => {
    try {
      onCodeSent(await request.mutateAsync(mobile));
    } catch (e) {
      if (isAppError(e)) form.applyServerError(e);
    }
  });
  const error = request.error && !request.error.fieldErrors ? request.error : null;

  return (
    <form noValidate onSubmit={submit} className="contents">
      <AuthShell
        title={title}
        back={onBack}
        actions={
          <Button type="submit" block loading={request.isPending}>
            دریافت کد ورود
          </Button>
        }
      >
        <p className="text-body-m text-fg-secondary">{intro}</p>
        {error ? (
          <Alert
            title={error.code === 'OTP_RATE_LIMITED' ? 'کمی صبر کنید' : 'کد ارسال نشد'}
            description={error.message}
          />
        ) : null}
        <form.Field name="mobile">{(f) => <IranMobileField {...f} autoFocus required />}</form.Field>
        <p className="text-body-m text-fg-secondary">
          کد ورود به همین شماره پیامک می‌شود.
          <br />
          با ادامه، شرایط استفاده و حریم خصوصی را می‌پذیرید.
        </p>
      </AuthShell>
    </form>
  );
}
