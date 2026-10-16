'use client';
import type { ListInfiniteView } from '@dukani/domain';
import { useEffect } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { Button } from '../primitives/Button';
import { Spinner } from '../primitives/Spinner';
import { INFINITE_ROOT_MARGIN } from './DataGrid.constants';
import { useInView } from './use-in-view';

/**
 * End of a mobile list: an invisible sentinel loads the next page well before the user gets there (and keeps
 * loading while it stays in range), a small spinner if the wait is noticeable, an inline error with retry that keeps
 * every loaded card, and «همهٔ N کالا نمایش داده شد». «نمایش بیشتر» stays reachable for keyboard and screen-reader
 * users (visible only on focus while auto-loading works).
 */
export function ListEnd({ view, unit }: { view: ListInfiniteView<unknown>; unit: string }) {
  const t = useUiTranslations();
  const { ref, inView, supported } = useInView<HTMLDivElement>(INFINITE_ROOT_MARGIN);
  const canLoad = view.hasNextPage && !view.isLoadingMore && !view.loadMoreError && !view.isPlaceholder;
  const { loadMore } = view;
  useEffect(() => {
    if (inView && canLoad) loadMore();
  }, [inView, canLoad, loadMore]);
  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      <div ref={ref} aria-hidden className="h-px w-full" />
      {view.isLoadingMore ? <Spinner size={24} className="text-fg-brand" /> : null}
      {view.loadMoreError ? (
        <div role="alert" className="flex flex-col items-center gap-2 text-center">
          <p className="text-body-s text-danger">{t('grid.loadMoreFailed')}</p>
          <Button variant="secondary" size="sm" onClick={view.retry}>
            {t('controls.retry')}
          </Button>
        </div>
      ) : null}
      {canLoad ? (
        <Button
          variant="text"
          className={supported ? 'sr-only focus:not-sr-only' : undefined}
          onClick={loadMore}
        >
          {t('grid.more')}
        </Button>
      ) : null}
      {!view.hasNextPage && view.items.length ? (
        <p className="text-body-s text-fg-secondary">{t('grid.end', { count: view.totalCount, unit })}</p>
      ) : null}
    </div>
  );
}
