'use client';
import { useId, useState } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { Icon } from '../icons/Icon';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import type { FilterAreaProps } from './FilterArea.types';

/**
 * Desktop strategy of `FilterArea`: a collapsible search form above the results. Fields in a grid; below all of
 * them «بازنشانی» and the Primary «جست‌وجو» at the inline end (left in RTL). Enter in any field applies; closing the
 * panel neither applies nor clears anything — the chips and badges keep the applied filters visible.
 * With only `search` (profile `compact`) it is the bare search form, as on mobile.
 */
export function FilterPanel({
  title,
  search,
  children,
  options,
  appliedCount,
  dirty,
  onApply,
  onReset,
  chips,
  defaultOpen = true,
  busy,
}: FilterAreaProps) {
  const t = useUiTranslations();
  const bodyId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const heading = title ?? t('filter.title');
  if (!children && !options)
    // compact profile: the search field alone above the list, Enter applies; no panel and no Primary
    return (
      <div className="flex flex-col gap-3">
        <form
          role="search"
          aria-label={heading}
          onSubmit={(event) => {
            event.preventDefault();
            onApply();
          }}
        >
          {search}
        </form>
        {chips}
      </div>
    );
  return (
    <section
      aria-label={heading}
      className="bg-surface border-line flex flex-col gap-4 rounded-md border p-4"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
        className="text-heading-s text-fg-primary focus-visible:outline-focus flex items-center gap-2 rounded-sm text-start focus-visible:outline-2"
      >
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} />
        <span className="flex-1">{heading}</span>
        {appliedCount ? <Badge tone="brand">{t('filter.applied', { count: appliedCount })}</Badge> : null}
        {dirty ? <Badge tone="warning">{t('filter.pending')}</Badge> : null}
      </button>
      <form
        id={bodyId}
        role="search"
        aria-label={heading}
        hidden={!open}
        onSubmit={(event) => {
          event.preventDefault();
          onApply();
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 items-end gap-4 xl:grid-cols-4">
          {search ? <div className="min-w-0 xl:col-span-2">{search}</div> : null}
          {children}
        </div>
        {options ? <div className="flex flex-wrap items-center gap-x-6 gap-y-3">{options}</div> : null}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button variant="text" onClick={onReset}>
            {t('filter.reset')}
          </Button>
          <Button type="submit" iconStart="search" loading={busy}>
            {t('filter.search')}
          </Button>
        </div>
      </form>
      {chips}
    </section>
  );
}
