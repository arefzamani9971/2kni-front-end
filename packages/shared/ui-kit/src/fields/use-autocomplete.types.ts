import type { KeyboardEvent } from 'react';

export type UseAutocompleteOptions<T> = {
  readonly items: readonly T[];
  readonly onSelect: (item: T) => void;
  readonly isDisabled?: (item: T) => boolean;
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  /** Enter with no active option. */
  readonly onSubmit?: () => void;
};

/** What the option renderers need from the shared controller. */
export type AutocompleteController = {
  readonly listId: string;
  readonly optionId: (index: number) => string;
  readonly active: number;
  readonly setActive: (index: number) => void;
  readonly reset: () => void;
  readonly choose: (index: number) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly activeDescendant: string | undefined;
};
