'use client';
import { memo } from 'react';
import { Chip, ChipGroup, FilterArea, SearchField, useFilterDraft } from '@dukani/ui-kit';
import { isCatalogSearchTooLong } from '../../domain/catalog-list';
import { CATALOG_FILTER_DEFAULTS } from '../../domain/catalog-list.constants';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import type { CatalogListSearchProps } from './CatalogListSearch.types';

/**
 * PAT-FILTER-01 profile `compact` (page contract cataloglist): typing edits only the draft and Enter applies it;
 * a type chip applies at once and keeps an unapplied search text as it is.
 */
export const CatalogListSearch = memo(function CatalogListSearch({
  applied,
  onApply,
  types,
}: CatalogListSearchProps) {
  const t = useCatalogTexts();
  const filters = useFilterDraft({ applied, defaults: CATALOG_FILTER_DEFAULTS, onApply });
  const tooLong = isCatalogSearchTooLong(filters.draft.q);
  return (
    <>
      <FilterArea
        title={t('searchItems')}
        appliedCount={filters.activeKeys.length}
        dirty={filters.dirty}
        onApply={() => {
          if (!tooLong) filters.apply();
        }}
        onReset={filters.reset}
        search={
          <SearchField
            label={t('searchItems')}
            placeholder={t('searchItemHint')}
            value={filters.draft.q}
            onChange={(q) => filters.set({ q })}
            status={tooLong ? 'error' : 'default'}
            message={tooLong ? t('searchTooLong') : undefined}
          />
        }
      />
      <ChipGroup className="flex-nowrap overflow-x-auto pb-1 *:shrink-0" label={t('searchTypes')}>
        <Chip selected={!applied.productTypeId} onClick={() => onApply({ ...applied, productTypeId: null })}>
          {t('all')}
        </Chip>
        {types?.map((type) => (
          <Chip
            key={type.id}
            selected={applied.productTypeId === type.id}
            onClick={() => onApply({ ...applied, productTypeId: type.id })}
          >
            {type.name}
          </Chip>
        ))}
      </ChipGroup>
    </>
  );
});
