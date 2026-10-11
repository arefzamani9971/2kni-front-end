import type { TextFieldProps } from './TextField.types';

export type SearchSuggestion = { id: string; label: string; description?: string };

export type SearchAutocompleteProps = Omit<TextFieldProps, 'type' | 'prefix' | 'clearable'> & {
  suggestions: readonly SearchSuggestion[];
  onSelect: (id: string) => void;
};
