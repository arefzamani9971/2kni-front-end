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

/**
 * Whether quantity × factor can be recorded in the base unit (F12 §7, §11): the exact product, never rounded, has no
 * more decimals than the base unit allows (none for a count unit) and stays within the line limit of 10⁹ base units,
 * as the server checks. 0.333 bags of 2.5 kg = 0.8325 kg does not fit a three-decimal kilogram.
 */
export const fitsBaseQuantity = (
  quantity: Quantity,
  baseQtyPerUnit: DecimalString,
  baseUnitMaxDecimals: number,
): boolean => {
  const qtyBase = toBaseQuantity(quantity, baseQtyPerUnit);
  return (
    decimal.decimalPlaces(qtyBase) <= Math.min(Math.max(baseUnitMaxDecimals, 0), 3) &&
    !decimal.gt(qtyBase, decimal.of('1000000000'))
  );
};
