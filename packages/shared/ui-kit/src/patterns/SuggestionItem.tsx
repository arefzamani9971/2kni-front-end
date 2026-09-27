import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';

export type SuggestionKind = 'ExactProduct' | 'QuickSuggestion' | 'Category' | 'CreateNew';

const KIND_ICON: Record<SuggestionKind, IconName> = {
  ExactProduct: 'products',
  QuickSuggestion: 'search',
  Category: 'list',
  CreateNew: 'plus',
};

/** Figma `Suggestion Item`: search result row (exact item, quick suggestion, category, create new). */
export function SuggestionItem({
  kind,
  title,
  description,
  onSelect,
  className,
}: {
  kind: SuggestionKind;
  title: ReactNode;
  description?: ReactNode;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex min-h-13 w-full items-center gap-3 border-b border-line px-1 py-2 text-start hover:bg-muted',
        kind === 'CreateNew' && 'text-fg-brand',
        className,
      )}
    >
      <Icon name={KIND_ICON[kind]} size={20} className={kind === 'CreateNew' ? 'text-fg-brand' : 'text-icon'} />
      <span className="flex flex-1 flex-col">
        <span className="text-body-m">{title}</span>
        {description ? <span className="text-body-s text-fg-secondary">{description}</span> : null}
      </span>
    </button>
  );
}
