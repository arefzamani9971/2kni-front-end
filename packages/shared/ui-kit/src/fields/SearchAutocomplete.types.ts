import type { ReactNode } from 'react';
import type { TextFieldProps } from './TextField.types';

export type SearchSuggestion = { id: string; label: string; description?: string };

export type SearchAutocompleteProps = Omit<TextFieldProps, 'type' | 'prefix' | 'clearable'> & {
  suggestions: readonly SearchSuggestion[];
  onSelect: (id: string) => void;
  /**
   * Shown in the popup instead of suggestions while the field is open and there is none to choose: below the
   * minimum («برای جست‌وجو حداقل ۳ نویسه وارد کنید»), empty or error (Figma Autocomplete Listbox 1313:1507).
   */
  notice?: ReactNode;
};
