import type { QuantityError } from './quantity.types';

export const QUANTITY_MESSAGES: Record<QuantityError, string> = {
  empty: 'مقدار را وارد کنید.',
  format: 'مقدار را فقط با رقم وارد کنید.',
  negative: 'مقدار منفی مجاز نیست.',
  'too-many-decimals': 'این واحد مقدار اعشاری نمی‌پذیرد.',
  'not-positive': 'مقدار باید بیشتر از صفر باشد.',
};
