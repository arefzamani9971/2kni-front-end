'use client';
import { cn } from '../lib/cn';
import type { AutocompleteOptionsProps } from './AutocompleteOptions.types';

/**
 * Mobile suggestions as cards (Autocomplete Product Option 1220:1248): the title, then the summary line or every
 * other column with its header. A tap chooses at once; there is no second confirmation.
 */
export function AutocompleteCardOptions<T>({
  items,
  columns,
  getItemKey,
  getItemLabel,
  getOptionLabel = getItemLabel,
  isItemDisabled,
  mobileSummary,
  label,
  control,
}: AutocompleteOptionsProps<T>) {
  return (
    <ul id={control.listId} role="listbox" aria-label={label} className="flex flex-col gap-2">
      {items.map((item, index) => {
        const disabled = isItemDisabled?.(item) ?? false;
        return (
          <li
            key={getItemKey(item)}
            id={control.optionId(index)}
            role="option"
            aria-selected={control.active === index}
            aria-disabled={disabled || undefined}
            aria-label={getOptionLabel(item)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => control.choose(index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                control.choose(index);
              }
            }}
            className={cn(
              'border-line bg-surface flex min-h-11 cursor-pointer flex-col gap-1 rounded-md border p-3',
              control.active === index && 'border-brand bg-brand-subtle',
              disabled && 'text-fg-tertiary cursor-not-allowed',
            )}
          >
            <span className="text-label-m text-fg-primary">{getItemLabel(item)}</span>
            <span className="text-body-s text-fg-secondary flex flex-wrap gap-x-3 gap-y-1">
              {mobileSummary
                ? mobileSummary(item)
                : columns.slice(1).map((column) => (
                    <span key={column.key}>
                      {column.header}: {column.render(item)}
                    </span>
                  ))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
