import { decimal, type DecimalString } from '../decimal/decimal';
import { money, type Money } from './money';

/**
 * API boundary for money (BCR-01, applied). The backend sends and accepts `…Amount` fields as decimal strings in the
 * single currency unit (toman): the value is taken AS IS, never divided or multiplied. Numbers are still accepted on
 * read for old fixtures.
 */
export const fromApiMoney = (value: number | string | null | undefined): Money | null =>
  value === null || value === undefined ? null : money(value);

export const toApiMoney = (m: Money): DecimalString => m.amount;

/** Quantities and other decimals travel as strings as well. */
export const toApiDecimal = (v: DecimalString | number | string): DecimalString => decimal.of(v);
