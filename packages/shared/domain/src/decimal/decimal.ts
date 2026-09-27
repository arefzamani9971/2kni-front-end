import type { Brand } from '../brand';
import { err, ok, type Result } from '../result';
import { normalizeDigits } from '../text/digits';
import { bigAdapter, type RoundingMode } from './big-adapter';

/** Canonical decimal as a string (`"1250.5"`). Never a JS float in domain logic. */
export type DecimalString = Brand<string, 'Decimal'>;
export type { RoundingMode };

const impl = bigAdapter;
const d = (v: string): DecimalString => v as DecimalString;

export const decimal = {
  of: (v: string | number | bigint): DecimalString => d(impl.normalize(typeof v === 'bigint' ? v.toString() : v)),
  zero: d('0'),
  add: (a: DecimalString, b: DecimalString): DecimalString => d(impl.add(a, b)),
  sub: (a: DecimalString, b: DecimalString): DecimalString => d(impl.sub(a, b)),
  mul: (a: DecimalString, b: DecimalString): DecimalString => d(impl.mul(a, b)),
  div: (a: DecimalString, b: DecimalString, dp = 6): DecimalString => d(impl.div(a, b, dp)),
  sum: (values: readonly DecimalString[]): DecimalString => values.reduce((acc, v) => d(impl.add(acc, v)), d('0')),
  cmp: (a: DecimalString, b: DecimalString): -1 | 0 | 1 => impl.cmp(a, b),
  eq: (a: DecimalString, b: DecimalString): boolean => impl.cmp(a, b) === 0,
  gt: (a: DecimalString, b: DecimalString): boolean => impl.cmp(a, b) === 1,
  lt: (a: DecimalString, b: DecimalString): boolean => impl.cmp(a, b) === -1,
  isZero: (a: DecimalString): boolean => impl.cmp(a, '0') === 0,
  isNegative: (a: DecimalString): boolean => impl.cmp(a, '0') === -1,
  round: (v: DecimalString, dp: number, mode: RoundingMode = 'half-up'): DecimalString => d(impl.round(v, dp, mode)),
  roundToStep: (v: DecimalString, step: DecimalString, mode: RoundingMode = 'half-up'): DecimalString =>
    d(impl.roundToStep(v, step, mode)),
  toFixed: (v: DecimalString, dp: number): string => impl.toFixed(v, dp),
  decimalPlaces: (v: DecimalString): number => (v.includes('.') ? v.split('.')[1]!.length : 0),
};

export type DecimalParseError = 'empty' | 'format' | 'negative' | 'too-many-decimals';

/**
 * Parses user input: Persian/Arabic digits, Persian decimal separator (٫) and thousands
 * separators (٬ , ،) are accepted. Scientific notation, signs (unless allowed) and letters are rejected.
 */
export const parseDecimalInput = (
  raw: string,
  opts: { maxDecimals?: number; allowNegative?: boolean } = {},
): Result<DecimalString, DecimalParseError> => {
  let s = normalizeDigits(raw).trim().replace(/[٬,،\s]/g, '').replace(/٫/g, '.');
  if (s === '') return err('empty');
  const negative = s.startsWith('-');
  if (negative) {
    if (!opts.allowNegative) return err('negative');
    s = s.slice(1);
  }
  if (!/^[0-9]+(\.[0-9]*)?$/.test(s) && !/^\.[0-9]+$/.test(s)) return err('format');
  const value = decimal.of(`${negative ? '-' : ''}${s.endsWith('.') ? s.slice(0, -1) : s}`);
  if (opts.maxDecimals !== undefined && decimal.decimalPlaces(value) > opts.maxDecimals) return err('too-many-decimals');
  return ok(value);
};
