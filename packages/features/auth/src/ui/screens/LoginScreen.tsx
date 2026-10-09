'use client';
import { AuthShell, Button, IranMobileField } from '@dukani/ui-kit';
import { useAuthModule } from '../../module';
import { useAuthTranslations } from '../i18n/use-auth-translations';
import { useLoginFlow } from '../hooks/use-login-flow';
import { createAuthCopy, createAuthBrand } from './auth-copy.constants';
import type { LoginScreenProps } from './LoginScreen.types';
/**
 * AUTH-01 (Figma 358:478 / desktop 358:5341) and AUTH-01-ERROR (405:6105): mobile number → SMS code.
 * No navigation before login (F01). The CTA is enabled only for a valid number, online and idle (F01 §4).
 */
export function LoginScreen({ title, intro, context, onBack, defaultMobile, onCodeSent }: LoginScreenProps) {
  const t = useAuthTranslations();
  context ??= t('brand');
  const { layout } = useAuthModule();
  const copy = createAuthCopy(t)[layout];
  const { form, submit, alert, clearSubmissionError, loading, disabled } = useLoginFlow({
    defaultMobile,
    onCodeSent,
  });

  return (
    <form noValidate onSubmit={submit} className="contents">
      <AuthShell
        {...(layout === 'split'
          ? { layout, back: copy.loginBack ? onBack : undefined, brand: createAuthBrand(t) }
          : { layout, subtitle: context, cardTitle: copy.loginCard })}
        title={title ?? copy.loginTitle}
        actions={
          <Button type="submit" block loading={loading} disabled={disabled}>
            {t('requestCode')}
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
                clearSubmissionError();
              }}
              autoFocus
            />
          )}
        </form.Field>
      </AuthShell>
    </form>
  );
}
