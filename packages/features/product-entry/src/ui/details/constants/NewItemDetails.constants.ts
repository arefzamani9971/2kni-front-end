import type { Dto } from '@dukani/contracts';
import type { EntryTranslator } from '../../i18n/types';
export const BRAND_UNKNOWN = 'unknown';

export const BRAND_NONE = 'none';

export const createBrandOptions = (brands: readonly Dto<'BrandDto'>[], t: EntryTranslator) => [
  { value: BRAND_UNKNOWN, label: t('unknown'), description: t('unknownBrand') },
  { value: BRAND_NONE, label: t('unbranded'), description: t('unbrandedHint') },
  ...brands.map((b) => ({ value: b.id, label: b.name, description: b.nameEn ?? undefined })),
];
