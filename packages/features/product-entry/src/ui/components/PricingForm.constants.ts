import type { PriceMethod } from '../../domain/entry-draft.types';

export const METHODS: { value: PriceMethod; label: string }[] = [
  { value: 'Manual', label: 'قیمت دستی' },
  { value: 'Markup', label: 'افزوده روی خرید' },
  { value: 'FixedProfit', label: 'سود ثابت' },
];
