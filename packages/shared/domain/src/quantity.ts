import { decimal, parseDecimalInput } from './decimal/decimal';
import type { DecimalString } from './decimal/decimal.types';
import { formatDecimalFa } from './money/money';
import { err, ok } from './result';
import type { Result } from './result.types';
import type { Quantity, QuantityError } from './quantity.types';

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
