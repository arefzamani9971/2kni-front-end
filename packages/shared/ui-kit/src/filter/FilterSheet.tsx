'use client';
import { useState } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { Overlay } from '../overlays/Overlay';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import type { FilterAreaProps } from './FilterArea.types';

/**
 * Mobile strategy of `FilterArea`: the search field stays above the list (Enter applies it); the other fields open
 * in the shared `Overlay` sheet with Apply at the bottom above the safe area. Closing the sheet without Apply keeps
 * the draft (marked «تغییر اعمال‌نشده») and does not touch the results.
 */
export function FilterSheet({
  title,
  search,
  children,
  options,
  appliedCount,
  dirty,
  onApply,
  onReset,
  chips,
  busy,
}: FilterAreaProps) {
  const t = useUiTranslations();
  const [open, setOpen] = useState(false);
  const heading = title ?? t('filter.title');
  return (
    <div className="flex flex-col gap-3">
      <form
        role="search"
        aria-label={heading}
        onSubmit={(event) => {
          event.preventDefault();
          onApply();
        }}
        className="flex items-end gap-2"
      >
        {search ? <div className="min-w-0 flex-1">{search}</div> : null}
        {children || options ? (
          <Button variant="secondary" iconStart="filter" aria-haspopup="dialog" onClick={() => setOpen(true)}>
            {t('filter.open')}
            {appliedCount ? (
              <Badge tone="brand" size="sm">
                {t('grid.number', { value: appliedCount })}
              </Badge>
            ) : null}
            {dirty ? (
              <span className="bg-warning size-2 rounded-full" aria-label={t('filter.pending')} />
            ) : null}
          </Button>
        ) : null}
      </form>
      {chips}
      {children || options ? (
        <Overlay
          open={open}
          onOpenChange={setOpen}
          title={heading}
          size="full"
          actions={
            <>
              <Button
                block
                loading={busy}
                onClick={() => {
                  onApply();
                  setOpen(false);
                }}
              >
                {t('filter.apply')}
              </Button>
              <Button block variant="text" onClick={onReset}>
                {t('filter.reset')}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            {children}
            {options}
          </div>
        </Overlay>
      ) : null}
    </div>
  );
}
