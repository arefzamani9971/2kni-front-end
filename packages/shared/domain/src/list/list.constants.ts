/** PAT-LIST-01: default page size and the options offered by the desktop pager. */
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
/** Server-side upper bound; no endpoint returns more rows per request. */
export const MAX_PAGE_SIZE = 100;
/** At most this many sort rules per request. */
export const MAX_SORT_RULES = 3;
