import { decimal } from '../decimal/decimal';
import type { Money, MoneyInputError } from './money.types';

export const MONEY_UNIT_LABEL = 'تومان';

export const MONEY_MAX_DECIMALS = 2;

export const ZERO_MONEY: Money = { amount: decimal.zero };

export const MONEY_INPUT_MESSAGES: Record<MoneyInputError, string> = {
  empty: 'مبلغ را وارد کنید.',
  format: 'مبلغ را فقط با رقم وارد کنید.',
  negative: 'مبلغ منفی مجاز نیست.',
  'too-many-decimals': 'مبلغ حداکثر دو رقم اعشار دارد.',
};
