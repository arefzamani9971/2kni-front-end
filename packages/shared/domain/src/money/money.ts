import { decimal, parseDecimalInput, type DecimalString } from '../decimal/decimal';
import { err, ok, type Result } from '../result';
import { toPersianDigits } from '../text/digits';

/**
 * Money: Decimal, one currency unit for the whole system, no Rial/Toman conversion anywhere
 * (BIZ-MNY-01). The unit label is display-only.
 */
export type Money = { readonly amount: DecimalString };

export const MONEY_UNIT_LABEL = 'تومان';
export const MONEY_MAX_DECIMALS = 2;

export const money = (v: string | number | bigint | DecimalString): Money => ({ amount: decimal.of(v) });
export const ZERO_MONEY: Money = { amount: decimal.zero };

export const moneyOps = {
  add: (a: Money, b: Money): Money => ({ amount: decimal.add(a.amount, b.amount) }),
  sub: (a: Money, b: Money): Money => ({ amount: decimal.sub(a.amount, b.amount) }),
  times: (a: Money, factor: DecimalString): Money => ({ amount: decimal.round(decimal.mul(a.amount, factor), MONEY_MAX_DECIMALS) }),
  sum: (items: readonly Money[]): Money => ({ amount: decimal.sum(items.map((m) => m.amount)) }),
  cmp: (a: Money, b: Money) => decimal.cmp(a.amount, b.amount),
  isZero: (a: Money) => decimal.isZero(a.amount),
  isNegative: (a: Money) => decimal.isNegative(a.amount),
  max: (a: Money, b: Money): Money => (decimal.cmp(a.amount, b.amount) >= 0 ? a : b),
};

/** Groups the integer part with the Persian thousands separator and converts digits. */
export const formatDecimalFa = (value: DecimalString, opts: { minDecimals?: number } = {}): string => {
  const negative = value.startsWith('-');
  const [intPart = '0', frac = ''] = (negative ? value.slice(1) : value).split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  const fraction = frac.padEnd(opts.minDecimals ?? 0, '0');
  const text = fraction ? `${grouped}٫${fraction}` : grouped;
  return `${negative ? '−' : ''}${toPersianDigits(text)}`;
};

/** «۴۱۰٬۰۰۰ تومان». `unit: false` hides the label for column layouts that show it in the header. */
export const formatMoney = (m: Money, opts: { unit?: boolean } = {}): string =>
  opts.unit === false ? formatDecimalFa(m.amount) : `${formatDecimalFa(m.amount)} ${MONEY_UNIT_LABEL}`;

export type MoneyInputError = 'empty' | 'format' | 'negative' | 'too-many-decimals';

export const parseMoneyInput = (raw: string, opts: { allowNegative?: boolean } = {}): Result<Money, MoneyInputError> => {
  const r = parseDecimalInput(raw, { maxDecimals: MONEY_MAX_DECIMALS, allowNegative: opts.allowNegative ?? false });
  return r.ok ? ok({ amount: r.value }) : err(r.error);
};

export const MONEY_INPUT_MESSAGES: Record<MoneyInputError, string> = {
  empty: 'مبلغ را وارد کنید.',
  format: 'مبلغ را فقط با رقم وارد کنید.',
  negative: 'مبلغ منفی مجاز نیست.',
  'too-many-decimals': 'مبلغ حداکثر دو رقم اعشار دارد.',
};
