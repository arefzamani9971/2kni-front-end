import { describe, expect, it } from 'vitest';
import {
  cycleSort,
  itemRangeOf,
  normalizePageSize,
  paginate,
  pagerItems,
  parseSortParam,
  sortDirectionOf,
  toSortParam,
  totalPagesOf,
} from './list';
import { PAGE_SIZE_OPTIONS } from './list.constants';

const labels = (page: number, total: number) =>
  pagerItems(page, total).map((item) => (item.kind === 'page' ? item.page : '…'));

describe('list paging helpers (PAT-LIST-01)', () => {
  it('derives page count and the shown range, including empty and last pages', () => {
    expect(totalPagesOf(0, 20)).toBe(0);
    expect(totalPagesOf(41, 20)).toBe(3);
    expect(itemRangeOf(3, 20, 41)).toEqual({ from: 41, to: 41 });
    expect(itemRangeOf(2, 20, 41)).toEqual({ from: 21, to: 40 });
    expect(itemRangeOf(1, 20, 0)).toEqual({ from: 0, to: 0 });
    expect(itemRangeOf(9, 20, 41)).toEqual({ from: 41, to: 41 });
  });

  it('keeps the numbered pager width constant and never hides a single page behind a gap', () => {
    expect(labels(1, 1)).toEqual([1]);
    expect(labels(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(labels(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20]);
    expect(labels(4, 20)).toEqual([1, 2, 3, 4, 5, '…', 20]);
    expect(labels(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20]);
    expect(labels(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20]);
    expect(labels(0, 0)).toEqual([]);
  });

  it('cycles a header sort and reads the primary direction only', () => {
    const asc = cycleSort([], 'title');
    expect(asc).toEqual([{ field: 'title', direction: 'asc' }]);
    const desc = cycleSort(asc, 'title');
    expect(desc).toEqual([{ field: 'title', direction: 'desc' }]);
    expect(cycleSort(desc, 'title')).toEqual([]);
    expect(cycleSort(desc, 'price')).toEqual([{ field: 'price', direction: 'asc' }]);
    expect(sortDirectionOf([{ field: 'price', direction: 'asc' }, { field: 'title', direction: 'desc' }], 'title')).toBe(
      undefined,
    );
  });

  it('round-trips the sort wire format and drops unknown fields', () => {
    expect(toSortParam([])).toBeUndefined();
    expect(toSortParam([{ field: 'title', direction: 'asc' }, { field: 'createdAt', direction: 'desc' }])).toBe(
      'title,-createdAt',
    );
    expect(parseSortParam('title,-createdAt,-secret,title', ['title', 'createdAt'] as const)).toEqual([
      { field: 'title', direction: 'asc' },
      { field: 'createdAt', direction: 'desc' },
    ]);
  });

  it('accepts only offered page sizes', () => {
    expect(normalizePageSize(50, PAGE_SIZE_OPTIONS)).toBe(50);
    expect(normalizePageSize(37, PAGE_SIZE_OPTIONS)).toBe(20);
    expect(normalizePageSize(1000, [1000])).toBe(20);
  });

  it('pages a complete list like the server, clamping an out-of-range page', () => {
    const items = Array.from({ length: 41 }, (_, i) => i + 1);
    expect(paginate(items, 3, 20)).toMatchObject({ items: [41], page: 3, totalPages: 3, hasNextPage: false });
    expect(paginate(items, 99, 20).page).toBe(3);
    expect(paginate([], 4, 20)).toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  });
});
