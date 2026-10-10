import { decimal } from '../decimal/decimal';
import type { Money } from './money.types';

export const MONEY_MAX_DECIMALS = 2;

export const ZERO_MONEY: Money = { amount: decimal.zero };
