import { decimal, fromApiMoney, type Money } from '@dukani/domain';
import type { AttentionItem, WeekBar } from './home.types';
import { HOME_ACTION_KINDS } from './home.constants';
export const attentionItems = (byKind: Readonly<Record<string, number>>): AttentionItem[] =>
  Object.entries(byKind)
    .filter(
      (entry): entry is [AttentionItem['kind'], number] =>
        entry[1] > 0 && HOME_ACTION_KINDS.some((kind) => kind === entry[0]),
    )
    .map(([kind, count]) => ({ kind, count }));
/** Bar height is approximate presentation geometry; amount remains an exact decimal string. */
export const weekBars = (series: readonly { from: string; netAmount: string | number }[]): WeekBar[] =>
  series.map((p) => {
    const amount = decimal.round(decimal.div(decimal.of(p.netAmount), decimal.of(1000)), 0);
    return { from: p.from, value: Number(amount), amount };
  });
export const moneyOrZero = (v: string | number | null | undefined): Money => fromApiMoney(v ?? 0)!;
