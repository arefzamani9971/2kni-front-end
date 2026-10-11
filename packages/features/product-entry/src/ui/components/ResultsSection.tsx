'use client';
import type { ReactNode } from 'react';
import type { AppInfiniteQueryResult } from '@dukani/data';
import { Button, PageState, Section, useAppErrorMessage } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** One independent result list (loading, error with retry of the failed page, empty, load more). */
export function ResultsSection<T extends { readonly id: string }>({
  title,
  list,
  enabled = true,
  emptyText,
  notice,
  renderItem,
}: {
  title: string;
  list: AppInfiniteQueryResult<T>;
  enabled?: boolean;
  emptyText: string;
  notice?: ReactNode;
  renderItem: (item: T) => ReactNode;
}) {
  const t = useEntryTranslations();
  const message = useAppErrorMessage();
  return (
    <Section title={title} className="desktop:p-6">
      {notice}
      {enabled && list.isLoading ? <PageState kind="loading" rows={2} /> : null}
      {list.error ? (
        <PageState
          kind="error"
          description={message(list.error)}
          action={
            <Button
              variant="secondary"
              onClick={() =>
                void (list.items.length && list.hasNextPage ? list.fetchNextPage() : list.refetch())
              }
            >
              {t('retry')}
            </Button>
          }
        />
      ) : null}
      {list.items.map((item) => (
        <div key={item.id} className="border-line flex flex-col gap-3 border-b pb-3">
          {renderItem(item)}
        </div>
      ))}
      {list.isSuccess && !list.items.length ? (
        <p className="text-body-m text-fg-secondary">{emptyText}</p>
      ) : null}
      {list.hasNextPage ? (
        <Button variant="secondary" loading={list.isFetchingNextPage} onClick={list.fetchNextPage}>
          {t('loadMore')}
        </Button>
      ) : null}
    </Section>
  );
}
