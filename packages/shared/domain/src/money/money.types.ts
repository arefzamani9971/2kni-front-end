import type { DecimalString } from '../decimal/decimal.types';

/**
 * Money: Decimal, one currency unit for the whole system, no Rial/Toman conversion anywhere
 * (BIZ-MNY-01). The unit label is display-only.
 */
export type Money = { readonly amount: DecimalString };

export type MoneyInputError = 'empty' | 'format' | 'negative' | 'too-many-decimals';
