'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { Icon } from '../icons/Icon';
import { Button } from '../primitives/Button';
import type { ActiveFilterChipsProps } from './ActiveFilterChips.types';

/** Applied filters as removable chips; removing one applies at once (PAT-FILTER-01). */
export function ActiveFilterChips({ items, onRemove, onClearAll }: ActiveFilterChipsProps) {
  const t = useUiTranslations();
  if (!items.length) return null;
  return (
    <ul
      aria-label={t('filter.applied', { count: items.length })}
      className="flex flex-wrap items-center gap-2"
    >
      {items.map((item) => (
        <li key={item.key}>
          <button
            type="button"
            aria-label={t('filter.remove', { label: item.label })}
            onClick={() => onRemove(item.key)}
            className="h-touch desktop:h-9 bg-brand-subtle text-fg-brand text-label-s focus-visible:outline-focus inline-flex items-center gap-1 rounded-full px-3 focus-visible:outline-2"
          >
            {item.label}
            <Icon name="close" size={14} />
          </button>
        </li>
      ))}
      {onClearAll && items.length > 1 ? (
        <li>
          <Button variant="text" size="sm" onClick={onClearAll}>
            {t('filter.clearAll')}
          </Button>
        </li>
      ) : null}
    </ul>
  );
}
