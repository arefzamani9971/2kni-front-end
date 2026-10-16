'use client';
import { useCallback, useMemo } from 'react';
import { Alert, FilterArea, useFilterDraft, Checkbox, SearchField, SelectField } from '@dukani/ui-kit';
import { useAttachmentSelection } from '../hooks/use-attachment-selection';
import { useAttachmentSearch } from '../hooks/use-attachment-search';
import { useAttachmentTranslations } from '../i18n/use-attachment-translations';
import { AttachmentRecords } from './AttachmentRecords';
import type { AttachmentRecordsProps } from './AttachmentRecords.types';
import type { AttachmentSelectionPanelProps } from './AttachmentSelectionPanel.types';
import { ATTACHMENT_FILTER_DEFAULTS } from '../hooks/attachment-search.constants';
import { categoryOptions } from './category-options';

export function AttachmentSelectionPanel({ draft, state }: AttachmentSelectionPanelProps) {
  const t = useAttachmentTranslations();
  const search = useAttachmentSearch();
  const filters = useFilterDraft({
    applied: search.list.query.filter,
    defaults: ATTACHMENT_FILTER_DEFAULTS,
    onApply: search.list.applyFilter,
  });
  const items =
    search.list.pageView.status !== 'idle' ? search.list.pageView.items : search.list.infiniteView.items;
  const rows = useMemo(() => [...items], [items]);
  const outside = useMemo(() => {
    const visibleIds = new Set(rows.map((candidate) => candidate.item.id));
    return draft.selections.reduce(
      (count, entry) => count + Number(!visibleIds.has(entry.row.catalogItemId)),
      0,
    );
  }, [draft.selections, rows]);
  const { edit } = state;
  const limitMessage = t('limit');
  const { selection, remember } = useAttachmentSelection(state, rows, limitMessage);
  const selectAll = async () => {
    const candidates = await search.snapshot();
    remember(candidates);
    return candidates.map((candidate) => candidate.item.id);
  };
  const onChange = useCallback<AttachmentRecordsProps['onChange']>(
    (id, changes) => {
      edit((current) => ({
        ...current,
        chunks: [],
        selections: current.selections.map((entry) =>
          entry.row.catalogItemId === id ? { ...entry, row: { ...entry.row, ...changes } } : entry,
        ),
      }));
    },
    [edit],
  );
  return (
    <>
      <FilterArea
        appliedCount={filters.activeKeys.length}
        dirty={filters.dirty}
        onApply={filters.apply}
        onReset={filters.reset}
        busy={search.list.pageView.isFetching || search.list.infiniteView.isFetching}
        options={
          <>
            <Checkbox
              label={t('storeTypeOnly')}
              checked={filters.draft.onlyStoreType !== false}
              onChange={(onlyStoreType) =>
                filters.set({ onlyStoreType, categoryId: null, productTypeId: null })
              }
            />
            <Checkbox
              label={t('notMember')}
              checked={filters.draft.onlyNotInMyStore === true}
              onChange={(onlyNotInMyStore) => filters.set({ onlyNotInMyStore })}
            />
          </>
        }
        search={
          <SearchField
            label={t('search')}
            value={filters.draft.q ?? ''}
            onChange={(q) => filters.set({ q })}
          />
        }
      >
        <SelectField
          label={t('category')}
          value={filters.draft.categoryId ?? ''}
          options={[{ value: '', label: t('all') }, ...categoryOptions(search.categories.data ?? [])]}
          onChange={(categoryId) => filters.set({ categoryId: categoryId || null, productTypeId: null })}
        />
        <SelectField
          label={t('type')}
          value={filters.draft.productTypeId ?? ''}
          options={[
            { value: '', label: t('all') },
            ...(search.types.data ?? [])
              .filter((type) => !filters.draft.categoryId || type.categoryId === filters.draft.categoryId)
              .map((type) => ({ value: type.id, label: type.name })),
          ]}
          onChange={(productTypeId) => filters.set({ productTypeId: productTypeId || null })}
        />
      </FilterArea>
      {outside > 0 ? (
        <p className="text-body-s text-fg-secondary">{t('outside', { count: outside })}</p>
      ) : null}
      <AttachmentRecords
        source={search.list}
        candidates={rows}
        selection={selection}
        onSelectAllResults={selectAll}
        disabled={state.busy}
        onChange={onChange}
      />
      <Alert tone="info" title={t('hint')} />
    </>
  );
}
