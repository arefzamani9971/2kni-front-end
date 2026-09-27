import { decimal, parseDecimalInput, type DecimalString } from './decimal/decimal';
import { formatDecimalFa } from './money/money';
import { err, ok, type Result } from './result';

/** Quantity in an item's base unit; decimals allowed only up to the unit's `maxDecimals` (0 for count items). */
export type Quantity = DecimalString;

export type QuantityError = 'empty' | 'format' | 'negative' | 'too-many-decimals' | 'not-positive';

export const QUANTITY_MESSAGES: Record<QuantityError, string> = {
  empty: 'مقدار را وارد کنید.',
  format: 'مقدار را فقط با رقم وارد کنید.',
  negative: 'مقدار منفی مجاز نیست.',
  'too-many-decimals': 'این واحد مقدار اعشاری نمی‌پذیرد.',
  'not-positive': 'مقدار باید بیشتر از صفر باشد.',
};

export const parseQuantity = (raw: string, maxDecimals: number): Result<Quantity, QuantityError> => {
  const r = parseDecimalInput(raw, { maxDecimals });
  if (!r.ok) return err(r.error);
  if (!decimal.gt(r.value, decimal.zero)) return err('not-positive');
  return ok(r.value);
};

/** Converts packs to base units: 3 packs × 20 = 60 (F12). */
export const toBaseQuantity = (quantity: Quantity, baseQtyPerUnit: DecimalString): Quantity =>
  decimal.mul(quantity, baseQtyPerUnit);

export const formatQuantity = (q: Quantity, unitName?: string): string =>
  unitName ? `${formatDecimalFa(q)} ${unitName}` : formatDecimalFa(q);
