import type { AppError } from '@dukani/domain';
import { useLocale } from '@dukani/i18n';
import { useUiTranslations } from './use-ui-translations';

/**
 * Preserve server details; translate transport fallbacks at render time. The backend words its ProblemDetails in
 * Persian, so outside Persian a known error code is translated instead; an unknown code keeps the server guidance.
 */
export function useAppErrorMessage() {
  const t = useUiTranslations();
  const locale = useLocale();
  return (error: AppError): string => {
    const codeKey = `appErrors.codes.${error.code}` as Parameters<typeof t>[0];
    if (error.messageSource !== 'fallback') {
      if (locale !== 'fa' && t.has(codeKey)) return t(codeKey);
      if (error.message) return error.message;
      if (t.has(codeKey)) return t(codeKey);
      return t(`appErrors.${error.kind}`);
    }
    if (error.code === 'ABORTED') return t('appErrors.aborted');
    if (error.code === 'NETWORK' && error.kind === 'Server') return t('appErrors.network');
    return t(`appErrors.${error.kind}`);
  };
}
