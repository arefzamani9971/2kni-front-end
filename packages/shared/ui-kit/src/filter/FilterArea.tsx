'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { FilterAreaProps } from './FilterArea.types';
import { FilterPanel } from './FilterPanel';
import { FilterSheet } from './FilterSheet';

/**
 * Search and filter of a list (PAT-FILTER-01): collapsible panel with the Primary «جست‌وجو» under every field on
 * desktop, search field + filter sheet on mobile. The draft/applied state comes from `useFilterDraft`; only the
 * panel's open/closed state is presentational and stays inside each strategy.
 */
export const FilterArea = createAdaptive<FilterAreaProps>('FilterArea', {
  mobile: FilterSheet,
  desktop: FilterPanel,
});
