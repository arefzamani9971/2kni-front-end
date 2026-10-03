import type { ReactNode } from 'react';

export type OptionListItem<V extends string = string> = {
  value: V;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type OptionListProps<V extends string> = {
  options: readonly OptionListItem<V>[];
  value?: V | '';
  onSelect: (value: V) => void;
  /** Accessible name of the listbox (the field label). */
  label?: string;
  empty?: ReactNode;
  className?: string;
};
