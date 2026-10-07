'use client';
import { toPersianDigits } from '@dukani/domain';
import { AuthShell, Button, OtpField } from '@dukani/ui-kit';
import type { ReactNode } from 'react';

import { formatCountdown } from '../../domain/otp-challenge';
import { useOtpFlow } from '../hooks/use-otp-flow';
import { AUTH_COPY, CUSTOMER_CONTEXT, SELLER_AUTH_BRAND } from './auth-copy.constants';
import type { OtpScreenProps } from './OtpScreen.types';

/**
 * AUTH-02 (seller Figma 358:479 / 358:5342, customer 310:396 / 310:34) and its states: otp-wrong (394:6038),
 * otp-expired (394:6059), otp-limited (394:6076), otp-send-failed (394:6091), AUTH-02-ERROR (405:6128), plus
 * USER_BLOCKED. Presentation only — the behavior is `useOtpFlow`.
 */
export function OtpScreen({ context = CUSTOMER_CONTEXT, ...options }: OtpScreenProps) {
  const flow = useOtpFlow(options);
  if (!flow) return null;
  const { form, problem, mobile, layout } = flow;
  const text = AUTH_COPY[layout];

  const changeNumberButton = (primary = false) => (
    <Button type="button" variant={primary ? 'primary' : 'secondary'} block onClick={flow.changeNumber}>
      {text.changeNumber}
    </Button>
  );
  // The shell places these actions in the seller card or the customer action bar.
  const pair = (main: ReactNode, second: ReactNode = changeNumberButton()) => (
    <>
      {main}
      {second}
    </>
  );

  const actions = (() => {
    switch (flow.mode) {
      case 'new-code':
      case 'retry-send':
        return pair(
          <Button
            type="button"
            block
            loading={flow.resending}
            disabled={!flow.online}
            onClick={flow.sendAgain}
          >
            {flow.mode === 'retry-send' ? 'تلاش دوباره' : 'دریافت کد جدید'}
          </Button>,
        );
      case 'change-only':
        return changeNumberButton(true);
      case 'fix':
        return pair(
          <Button type="submit" block loading={flow.verifying} disabled={!flow.online}>
            اصلاح کد
          </Button>,
        );
      default: {
        const confirm = (
          <Button
            type="submit"
            block
            loading={flow.verifying}
            disabled={!form.formState.isValid || !flow.online}
          >
            تأیید و ورود
          </Button>
        );
        // customer frames (310:396 / 310:34) keep «بازگشت» beside the confirm action
        return text.otpBack
          ? pair(
              confirm,
              <Button type="button" variant="secondary" block onClick={flow.changeNumber}>
                بازگشت
              </Button>,
            )
          : confirm;
      }
    }
  })();

  return (
    <form noValidate onSubmit={flow.submit} className="contents">
      <AuthShell
        {...(layout === 'split'
          ? {
              layout,
              back: flow.changeNumber,
              brand: SELLER_AUTH_BRAND,
              recovery: !!problem && problem.kind !== 'other',
            }
          : { layout, subtitle: context, cardTitle: text.otpCard })}
        title={flow.alert && problem?.kind !== 'other' ? flow.alert.title : text.otpTitle}
        actions={actions}
        identity={<p>{problem && layout === 'split' ? `شماره موبایل: ${mobile}` : text.otpLead(mobile)}</p>}
        notice={flow.alert ?? undefined}
        note={
          problem ? undefined : (
            <p aria-live="polite">
              {flow.resendIn > 0
                ? `ارسال دوباره تا ${formatCountdown(flow.resendIn)} دیگر`
                : 'اگر کد نرسید، دوباره درخواست کنید.'}
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
                disabled={flow.resendIn > 0 || !flow.online}
                loading={flow.resending}
                onClick={flow.sendAgain}
              >
                ارسال دوباره کد
              </Button>
            </>
          )
        }
      >
        {flow.blocking ? null : (
          <form.Field name="code">
            {(f) => (
              <OtpField
                {...f}
                onChange={(v) => {
                  f.onChange(v);
                  flow.onCodeEdited();
                }}
                label={`کد ورود ${toPersianDigits(String(flow.challenge.codeLength))} رقمی`}
                autoFocus
                hint={flow.devCode ? `کد آزمایشی: ${toPersianDigits(flow.devCode)}` : undefined}
              />
            )}
          </form.Field>
        )}
      </AuthShell>
    </form>
  );
}
