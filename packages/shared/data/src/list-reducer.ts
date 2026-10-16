import { MAX_SORT_RULES, normalizePageSize, PAGE_SIZE_OPTIONS } from '@dukani/domain';
import type { AppListOptions, ListAction, ListState } from './list.types';

/** Initial query state; an invalid page size or page falls back to the defaults instead of reaching the server. */
export function initialListState<T, F, S extends string>(options: AppListOptions<T, F, S>): ListState<F, S> {
  const page = options.initialPage;
  return {
    page: page !== undefined && Number.isInteger(page) && page >= 1 ? page : 1,
    pageSize: normalizePageSize(options.initialPageSize, options.pageSizeOptions ?? PAGE_SIZE_OPTIONS),
    sort: (options.initialSort ?? []).slice(0, MAX_SORT_RULES),
    filter: options.initialFilter,
    presentation: null,
  };
}

/**
 * Query transitions of PAT-LIST-02: a new filter, sort or page size starts again at page 1; the same value is a
 * no-op (same state object, so no re-render and no new request).
 */
export function listReducer<F, S extends string>(state: ListState<F, S>, action: ListAction<F, S>): ListState<F, S> {
  switch (action.type) {
    case 'page': {
      const page = Number.isInteger(action.page) && action.page >= 1 ? action.page : 1;
      return page === state.page ? state : { ...state, page };
    }
    case 'pageSize': {
      const pageSize = normalizePageSize(action.pageSize, action.options);
      return pageSize === state.pageSize ? state : { ...state, pageSize, page: 1 };
    }
    case 'sort': {
      const sort = action.sort.slice(0, MAX_SORT_RULES);
      const same =
        sort.length === state.sort.length &&
        sort.every((rule, i) => rule.field === state.sort[i]!.field && rule.direction === state.sort[i]!.direction);
      return same ? state : { ...state, sort, page: 1 };
    }
    case 'filter':
      return Object.is(action.filter, state.filter) ? state : { ...state, filter: action.filter, page: 1 };
    case 'present':
      return action.presentation === state.presentation ? state : { ...state, presentation: action.presentation };
  }
}
