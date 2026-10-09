import { useLocale } from '@dukani/i18n';
import { normalizeDigits } from '@dukani/domain';
import { formatCountdown } from '../../domain/otp-challenge';
import { useAuthTranslations } from './use-auth-translations';
export function useAuthProblemCopy() {
  const t = useAuthTranslations();
  const locale = useLocale();
  const copy = (kind: 'wrong' | 'expired' | 'limited' | 'send-failed' | 'blocked') => ({
    title: t(`problems.${kind}.title`),
    description: t(`problems.${kind}.description`),
  });
  return {
    problems: {
      wrong: copy('wrong'),
      expired: copy('expired'),
      limited: copy('limited'),
      'send-failed': copy('send-failed'),
      blocked: copy('blocked'),
    },
    limitedMessage: (seconds: number) =>
      seconds > 0
        ? t('limitedWait', {
            time: locale === 'fa' ? formatCountdown(seconds) : normalizeDigits(formatCountdown(seconds)),
          })
        : t('limitedReady'),
  };
}
