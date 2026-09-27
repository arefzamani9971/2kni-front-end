import { money, type Money } from './money';

/**
 * API boundary for money (BCR-01). The current backend returns integer fields named `…Rials`
 * (int64). By product decision there is no Rial/Toman difference: the value is taken AS IS
 * (no division). When the backend moves to decimal `…Amount` fields, only these two functions
 * and the generated contracts change.
 */
export const fromApiMoney = (value: number | string | null | undefined): Money | null =>
  value === null || value === undefined ? null : money(value);

export const toApiMoney = (m: Money): number => {
  if (m.amount.includes('.')) {
    throw new Error('BCR-01: the current API accepts whole amounts only.');
  }
  return Number(m.amount);
};
