import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MAX_SORT_RULES } from './list.constants';
import type { ItemRange, PagedResult, PagerItem, SortDirection, SortRule } from './list.types';

const range = (start: number, end: number): number[] =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);

/** `ceil(totalCount / pageSize)`; 0 when there is nothing to show. */
export const totalPagesOf = (totalCount: number, pageSize: number): number =>
  totalCount > 0 && pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;

/** «21–40 of 41»: the 1-based positions shown on `page`; `{0, 0}` for an empty result. */
export function itemRangeOf(page: number, pageSize: number, totalCount: number): ItemRange {
  if (totalCount <= 0 || pageSize <= 0) return { from: 0, to: 0 };
  const last = totalPagesOf(totalCount, pageSize);
  const current = Math.min(Math.max(1, page), last);
  return { from: (current - 1) * pageSize + 1, to: Math.min(current * pageSize, totalCount) };
}

/**
 * Numbered pager with a constant width: first and last page, `siblings` around the current page, and gaps.
 * `1 … 9 10 11 … 20`. A gap never hides a single page (`1 2 3 4 5 … 20`, not `1 … 3 4 5 … 20`).
 */
export function pagerItems(page: number, totalPages: number, siblings = 1): PagerItem[] {
  if (totalPages <= 0) return [];
  const current = Math.min(Math.max(1, page), totalPages);
  const boundary = 1;
  const end = range(Math.max(totalPages - boundary + 1, boundary + 1), totalPages);
  const siblingsStart = Math.max(
    Math.min(current - siblings, totalPages - boundary - siblings * 2 - 1),
    boundary + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundary + siblings * 2 + 2),
    end.length > 0 ? end[0]! - 2 : totalPages - 1,
  );
  const startGap: (number | 'gap-start')[] =
    siblingsStart > boundary + 2
      ? ['gap-start']
      : boundary + 1 < totalPages - boundary
        ? [boundary + 1]
        : [];
  const endGap: (number | 'gap-end')[] =
    siblingsEnd < totalPages - boundary - 1
      ? ['gap-end']
      : totalPages - boundary > boundary
        ? [totalPages - boundary]
        : [];
  return [1, ...startGap, ...range(siblingsStart, siblingsEnd), ...endGap, ...end].map((entry) =>
    typeof entry === 'number' ? { kind: 'page', page: entry } : { kind: 'gap', key: entry },
  );
}

/** Header click cycle on one column: none → ascending → descending → back to the endpoint's default order. */
export function cycleSort<S extends string>(sort: readonly SortRule<S>[], field: S): SortRule<S>[] {
  const current = sortDirectionOf(sort, field);
  if (current === undefined) return [{ field, direction: 'asc' }];
  if (current === 'asc') return [{ field, direction: 'desc' }];
  return [];
}

/** Direction of `field` when it is the primary sort; secondary rules do not mark a header. */
export const sortDirectionOf = <S extends string>(
  sort: readonly SortRule<S>[],
  field: S,
): SortDirection | undefined => (sort[0]?.field === field ? sort[0].direction : undefined);

/** Wire format of PAT-LIST-01: `title,-createdAt`; `undefined` keeps the endpoint default. */
export const toSortParam = (sort: readonly SortRule[]): string | undefined =>
  sort.length
    ? sort
        .slice(0, MAX_SORT_RULES)
        .map((rule) => (rule.direction === 'desc' ? `-${rule.field}` : rule.field))
        .join(',')
    : undefined;

/** Reads a `sort` URL/query value; unknown fields are dropped instead of being sent to the server. */
export function parseSortParam<S extends string>(
  value: string | null | undefined,
  allowed: readonly S[],
): SortRule<S>[] {
  if (!value) return [];
  const rules: SortRule<S>[] = [];
  for (const part of value.split(',')) {
    const desc = part.startsWith('-');
    const field = (desc ? part.slice(1) : part).trim() as S;
    if (allowed.includes(field) && !rules.some((rule) => rule.field === field))
      rules.push({ field, direction: desc ? 'desc' : 'asc' });
  }
  return rules.slice(0, MAX_SORT_RULES);
}

/** A page size the pager offers; anything else falls back to the default instead of hitting the server. */
export function normalizePageSize(size: number | undefined, options: readonly number[]): number {
  const valid = options.filter((option) => Number.isInteger(option) && option > 0 && option <= MAX_PAGE_SIZE);
  if (size !== undefined && valid.includes(size)) return size;
  return valid.includes(DEFAULT_PAGE_SIZE) ? DEFAULT_PAGE_SIZE : (valid[0] ?? DEFAULT_PAGE_SIZE);
}

/**
 * Pages a complete in-memory list (`local-complete` profile, mocks, tests) with the same envelope and clamping as
 * the server: an out-of-range page returns the last page.
 */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): PagedResult<T> {
  const totalCount = items.length;
  const totalPages = totalPagesOf(totalCount, pageSize);
  const effective = totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
  const start = (effective - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: effective,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: effective > 1,
    hasNextPage: effective < totalPages,
  };
}
