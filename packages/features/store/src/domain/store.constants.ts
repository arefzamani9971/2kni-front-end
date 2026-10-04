import type { Dto } from '@dukani/contracts';
import type { BusinessMode } from './store.types';

export const BUSINESS_MODE_LABELS: Record<BusinessMode, string> = {
  Retail: 'خرده‌فروشی',
  Wholesale: 'عمده‌فروشی',
  Both: 'هر دو',
};

/** Heading of the STORE-04 details card (Figma 385:8945 «خرده‌فروشی و عمده‌فروشی»). */
export const BUSINESS_MODE_TITLES: Record<BusinessMode, string> = {
  Retail: 'خرده‌فروشی',
  Wholesale: 'عمده‌فروشی',
  Both: 'خرده‌فروشی و عمده‌فروشی',
};

/** ST02 helper text per store type key (what the type pre-configures). */
export const STORE_TYPE_HINTS: Readonly<Record<string, string>> = {
  stationery: 'دفتر، نوشت‌افزار، لوازم هنری',
  cosmetics: 'رنگ، حجم، نوع پوست و تاریخ',
  clothing: 'سایز، رنگ، جنس و فصل',
  supermarket: 'وزن، تاریخ مصرف و واحد فروش',
};

export const ROLE_LABELS: Record<Dto<'MemberRole'>, string> = { Owner: 'مالک', Staff: 'همکار' };
