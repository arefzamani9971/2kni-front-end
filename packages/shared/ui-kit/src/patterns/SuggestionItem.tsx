import type { ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { SuggestionKind } from './SuggestionItem.types';
import { KIND_ICON } from './SuggestionItem.constants';

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
        'border-line bg-surface hover:bg-muted flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-start transition-colors',
        className,
      )}
    >
      <span className="bg-brand-subtle text-icon-brand flex size-10 shrink-0 items-center justify-center rounded-md">
        <Icon name={KIND_ICON[kind]} size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn('text-label-m', kind === 'CreateNew' ? 'text-fg-brand' : 'text-fg-primary')}>
          {title}
        </span>
        {description ? <span className="text-caption text-fg-secondary">{description}</span> : null}
      </span>
      <Icon name="chevron-end" size={20} className="text-icon shrink-0" />
    </button>
  );
}
