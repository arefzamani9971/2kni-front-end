'use client';
import { itemRangeOf, pagerItems, totalPagesOf } from '@dukani/domain';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { IconButton } from '../primitives/IconButton';
import { PageSizeSelect } from './PageSizeSelect';
import type { PagerProps } from './Pager.types';

/**
 * Desktop pagination (PAT-LIST-02): shown range and total, page size, previous/next and numbered pages with gaps.
 * Nothing for an empty result («صفحهٔ ۱ از ۰» is never shown); a single page keeps only range and size.
 */
export function Pager({
  page,
  pageSize,
  totalCount,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  label,
  unit,
}: PagerProps) {
  const t = useUiTranslations();
  if (totalCount <= 0) return null;
  const totalPages = totalPagesOf(totalCount, pageSize);
  const { from, to } = itemRangeOf(page, pageSize, totalCount);
  return (
    <nav
      aria-label={t('grid.pagination', { label })}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-body-s text-fg-secondary" aria-live="polite">
        {t('grid.range', { from, to, total: totalCount, unit })}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <PageSizeSelect value={pageSize} options={pageSizeOptions} onChange={onPageSizeChange} />
        {totalPages > 1 ? (
          <ol className="flex items-center gap-1">
            <li>
              <IconButton
                icon="chevron-start"
                label={t('grid.previous')}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              />
            </li>
            {pagerItems(page, totalPages).map((item) =>
              item.kind === 'gap' ? (
                <li key={item.key} aria-hidden className="text-fg-secondary w-8 text-center">
                  …
                </li>
              ) : (
                <li key={item.page}>
                  <button
                    type="button"
                    aria-label={t('grid.page', { page: item.page })}
                    aria-current={item.page === page ? 'page' : undefined}
                    onClick={() => onPageChange(item.page)}
                    className={cn(
                      'text-label-m focus-visible:outline-focus size-10 rounded-md focus-visible:outline-2',
                      item.page === page ? 'bg-action text-fg-inverse' : 'text-fg-primary hover:bg-muted',
                    )}
                  >
                    {t('grid.number', { value: item.page })}
                  </button>
                </li>
              ),
            )}
            <li>
              <IconButton
                icon="chevron-end"
                label={t('grid.next')}
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              />
            </li>
          </ol>
        ) : null}
      </div>
    </nav>
  );
}
