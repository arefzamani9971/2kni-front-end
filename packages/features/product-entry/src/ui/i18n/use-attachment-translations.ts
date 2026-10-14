import { useCatalogTranslations } from '@dukani/i18n';
import fa from './attachments.fa.json';
import en from './attachments.en.json';

export function useAttachmentTranslations() {
  return useCatalogTranslations({ fa, en });
}
