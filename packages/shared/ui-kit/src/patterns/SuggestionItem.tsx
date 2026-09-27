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

/**
 * Figma `Production/Suggestion Item` (494:52): card (radius lg, border default, px spacing/4, py spacing/3, gap spacing/3)
 * with a 40px brand-subtle icon tile, Label/M title, 11px meta and a trailing chevron.
 */
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
        'flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-start transition-colors hover:bg-muted',
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-icon-brand">
        <Icon name={KIND_ICON[kind]} size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn('text-label-m', kind === 'CreateNew' ? 'text-fg-brand' : 'text-fg-primary')}>{title}</span>
        {description ? <span className="text-caption text-fg-secondary">{description}</span> : null}
      </span>
      <Icon name="chevron-end" size={20} className="shrink-0 text-icon" />
    </button>
  );
}
