import type { IconName } from '../icons/Icon.types';
import type { SuggestionKind } from './SuggestionItem.types';

export const KIND_ICON: Record<SuggestionKind, IconName> = {
  ExactProduct: 'products',
  QuickSuggestion: 'search',
  Category: 'list',
  CreateNew: 'plus',
};
