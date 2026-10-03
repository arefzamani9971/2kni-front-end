import type { Brand } from '../brand';

/** Canonical decimal as a string (`"1250.5"`). Never a JS float in domain logic. */
export type DecimalString = Brand<string, 'Decimal'>;

export type DecimalParseError = 'empty' | 'format' | 'negative' | 'too-many-decimals';
