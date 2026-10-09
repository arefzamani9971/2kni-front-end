import type { Locale } from './types';

/** Format an exact canonical decimal without converting its amount to a floating-point number. */
export function formatDecimalString(value: string, locale: Locale): string {
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) throw new TypeError('Expected a canonical decimal string');
  const negative = value.startsWith('-');
  const [integer, fraction] = (negative ? value.slice(1) : value).split('.');
  const formatter = new Intl.NumberFormat(locale);
  const grouped = formatter.format(BigInt(integer!));
  const separator = formatter.formatToParts(1.1).find((part) => part.type === 'decimal')!.value;
  const digits = new Intl.NumberFormat(locale, { useGrouping: false });
  return `${negative ? '-' : ''}${grouped}${fraction ? separator + [...fraction].map((digit) => digits.format(Number(digit))).join('') : ''}`;
}
