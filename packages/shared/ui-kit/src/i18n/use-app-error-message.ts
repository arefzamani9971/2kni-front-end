import type { AppError } from '@dukani/domain';
import { useUiTranslations } from './use-ui-translations';
/** Preserve server details; translate transport fallbacks at render time. */
export function useAppErrorMessage() {
  const t = useUiTranslations();
  return (error: AppError): string => {
    if (error.messageSource !== 'fallback') return error.message;
    if (error.code === 'ABORTED') return t('appErrors.aborted');
    if (error.code === 'NETWORK' && error.kind === 'Server') return t('appErrors.network');
    return t(`appErrors.${error.kind}`);
  };
}
