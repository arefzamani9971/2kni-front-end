import type { DecimalString } from './decimal/decimal.types';

/** Quantity in an item's base unit; decimals allowed only up to the unit's `maxDecimals` (0 for count items). */
export type Quantity = DecimalString;

export type QuantityError = 'empty' | 'format' | 'negative' | 'too-many-decimals' | 'not-positive';
