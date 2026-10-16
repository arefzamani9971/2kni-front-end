'use client';
import { useAuthTranslations } from '../i18n/use-auth-translations';
import { useLocale } from '@dukani/i18n';
import { normalizeDigits } from '@dukani/domain';
import { toPersianDigits } from '@dukani/domain';
import { AuthShell, Button, OtpField } from '@dukani/ui-kit';
import type { ReactNode } from 'react';

import { formatCountdown } from '../../domain/otp-challenge';
import { authNotice } from '../components/auth-notice';
import { Countdown } from '../components/Countdown';
import { useOtpFlow } from '../hooks/use-otp-flow';
import { createAuthCopy, createAuthBrand } from './auth-copy.constants';
import type { OtpScreenProps } from './OtpScreen.types';

/**
 * AUTH-02 (seller Figma 358:479 / 358:5342, customer 310:396 / 310:34) and its states: otp-wrong (394:6038),
 * otp-expired (394:6059), otp-limited (394:6076), otp-send-failed (394:6091), AUTH-02-ERROR (405:6128), plus
 * USER_BLOCKED. Presentation only — the behavior is `useOtpFlow`. Countdowns tick in their own leaves and the confirm
 * CTA reads validity in `form.Status`, so the code field is not re-rendered every second.
 */
export function OtpScreen({ context, ...options }: OtpScreenProps) {
  const t = useAuthTranslations();
  const locale = useLocale();
  const digits = (value: string) => (locale === 'fa' ? toPersianDigits(value) : normalizeDigits(value));
  context ??= t('brand');
  const flow = useOtpFlow(options);
  if (!flow) return null;
  const { form, problem, mobile, layout } = flow;
  const text = createAuthCopy(t)[layout];

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
            {flow.mode === 'retry-send' ? t('retry') : t('newCode')}
          </Button>,
        );
      case 'change-only':
        return changeNumberButton(true);
      case 'fix':
        return pair(
          <Button type="submit" block loading={flow.verifying} disabled={!flow.online}>
            {t('fixCode')}
          </Button>,
        );
      default: {
        const confirm = (
          <form.Status>
            {(status) => (
              <Button type="submit" block loading={flow.verifying} disabled={!status.isValid || !flow.online}>
                {t('confirm')}
              </Button>
            )}
          </form.Status>
        );
        // customer frames (310:396 / 310:34) keep «بازگشت» beside the confirm action
        return text.otpBack
          ? pair(
              confirm,
              <Button type="button" variant="secondary" block onClick={flow.changeNumber}>
                {t('back')}
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
              brand: createAuthBrand(t),
              recovery: !!problem && problem.kind !== 'other',
            }
          : { layout, subtitle: context, cardTitle: text.otpCard })}
        title={flow.alert && problem?.kind !== 'other' ? flow.alert.title : text.otpTitle}
        actions={actions}
        identity={<p>{problem && layout === 'split' ? t('identity', { mobile }) : text.otpLead(mobile)}</p>}
        notice={authNotice(flow.alert)}
        note={
          problem ? undefined : (
            <p aria-live="polite">
              {flow.resendReady ? (
                t('missingCode')
              ) : (
                <Countdown key={flow.resendAt} until={flow.resendAt}>
                  {(seconds) => t('resendIn', { time: digits(formatCountdown(seconds)) })}
                </Countdown>
              )}
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
                disabled={!flow.resendReady || !flow.online}
                loading={flow.resending}
                onClick={flow.sendAgain}
              >
                {t('resend')}
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
                message={problem?.kind === 'wrong' ? t('wrongCode') : f.message}
                onChange={(v) => {
                  f.onChange(v);
                  flow.onCodeEdited();
                }}
                label={t('codeLabel', { count: flow.challenge.codeLength })}
                autoFocus
                hint={flow.devCode ? t('devCode', { code: digits(flow.devCode) }) : undefined}
              />
            )}
          </form.Field>
        )}
      </AuthShell>
    </form>
  );
}
