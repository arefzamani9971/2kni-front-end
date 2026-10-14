'use client';
import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  PageState,
  SearchField,
  SelectField,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import { appError } from '@dukani/domain';
import { selectAttachmentCandidates } from '../../domain/catalog-attachment';
import { useAttachmentSearch } from '../hooks/use-attachment-search';
import { useAttachmentTranslations } from '../i18n/use-attachment-translations';
import { AttachmentRecords } from './AttachmentRecords';
import type { AttachmentSelectionPanelProps } from './AttachmentSelectionPanel.types';
import { categoryOptions } from './category-options';

export function AttachmentSelectionPanel({ draft, state }: AttachmentSelectionPanelProps) {
  const t = useAttachmentTranslations();
  const message = useAppErrorMessage();
  const search = useAttachmentSearch();
  const [text, setText] = useState(search.query.q ?? '');
  const rows = search.results.data?.items ?? [];
  const outside = draft.selections.filter(
    (entry) => !rows.some((candidate) => candidate.item.id === entry.row.catalogItemId),
  ).length;
  const select = (candidates: typeof rows) =>
    state.update((current) => {
      const selections = selectAttachmentCandidates(current.selections, candidates);
      if (selections.length > 1000) throw appError('Validation', 'VALIDATION_FAILED', t('limit'));
      return { ...current, selections, chunks: [] };
    });
  return (
    <>
      <form
        className="desktop:grid-cols-4 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          search.change({ q: text });
        }}
      >
        <div className="desktop:col-span-2 flex min-w-0 items-end gap-2">
          <SearchField label={t('search')} value={text} onChange={setText} className="min-w-0 flex-1" />
          <Button type="submit" variant="secondary">
            {t('searchAction')}
          </Button>
        </div>
        <SelectField
          label={t('category')}
          value={search.query.categoryId ?? ''}
          options={[{ value: '', label: t('all') }, ...categoryOptions(search.categories.data ?? [])]}
          onChange={(categoryId) => search.change({ categoryId: categoryId || null, productTypeId: null })}
        />
        <SelectField
          label={t('type')}
          value={search.query.productTypeId ?? ''}
          options={[
            { value: '', label: t('all') },
            ...(search.types.data ?? [])
              .filter((type) => !search.query.categoryId || type.categoryId === search.query.categoryId)
              .map((type) => ({ value: type.id, label: type.name })),
          ]}
          onChange={(productTypeId) => search.change({ productTypeId: productTypeId || null })}
        />
      </form>
      <Checkbox
        label={t('notMember')}
        checked={search.query.onlyNotInMyStore === true}
        onChange={(onlyNotInMyStore) => search.change({ onlyNotInMyStore })}
      />
      <div className="bg-brand-subtle flex flex-wrap items-center gap-3 rounded-md p-3">
        <p className="text-label-m" aria-live="polite">
          {t('selected', { count: draft.selections.length })}
        </p>
        <Button
          variant="secondary"
          disabled={state.busy || !rows.length}
          onClick={() => void state.run(() => select(rows))}
        >
          {t('selectPage')}
        </Button>
        <Button
          variant="secondary"
          disabled={state.busy || !rows.length}
          onClick={() => void state.run(async () => select(await search.snapshot()))}
        >
          {t('selectAll')}
        </Button>
        <Button
          variant="text"
          disabled={state.busy || !draft.selections.length}
          onClick={() =>
            void state.run(() => state.update((current) => ({ ...current, selections: [], chunks: [] })))
          }
        >
          {t('clear')}
        </Button>
      </div>
      {outside > 0 ? (
        <p className="text-body-s text-fg-secondary">{t('outside', { count: outside })}</p>
      ) : null}
      {search.results.error ? (
        <PageState
          kind="error"
          description={message(search.results.error)}
          action={<Button onClick={() => void search.results.refetch()}>{t('retry')}</Button>}
        />
      ) : search.results.isPending ? (
        <PageState kind="loading" />
      ) : rows.length === 0 ? (
        <PageState kind="empty" title={t('empty')} />
      ) : (
        <AttachmentRecords
          candidates={rows}
          selections={draft.selections}
          disabled={state.busy}
          onSelect={(candidate, checked) =>
            void state.run(() =>
              checked
                ? select([candidate])
                : state.update((current) => ({
                    ...current,
                    chunks: [],
                    selections: current.selections.filter(
                      (entry) => entry.row.catalogItemId !== candidate.item.id,
                    ),
                  })),
            )
          }
          onChange={(id, changes) =>
            state.edit((current) => ({
              ...current,
              chunks: [],
              selections: current.selections.map((entry) =>
                entry.row.catalogItemId === id ? { ...entry, row: { ...entry.row, ...changes } } : entry,
              ),
            }))
          }
        />
      )}
      <nav className="flex flex-wrap items-center justify-between gap-3" aria-label={t('title')}>
        <Button
          variant="secondary"
          disabled={search.page === 0 || search.results.isFetching}
          onClick={search.previous}
        >
          {t('previous')}
        </Button>
        <p className="text-body-s">
          {t('page', { page: search.page + 1, total: search.results.data?.totalCount ?? 0 })}
        </p>
        <Button
          variant="secondary"
          disabled={!search.results.data?.nextCursor || search.results.isFetching}
          onClick={search.next}
        >
          {t('next')}
        </Button>
      </nav>
      <Alert tone="info" title={t('hint')} />
    </>
  );
}
