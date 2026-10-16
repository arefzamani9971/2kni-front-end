import type { ListSource, ListStatus } from '@dukani/domain';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import type { GridColumn } from '../grid/DataGrid.types';

export type StoryProduct = {
  readonly id: string;
  readonly title: string;
  readonly barcode: string;
  readonly unit: string;
  readonly stock: number;
  readonly price: number;
  readonly brand: string;
  readonly available: boolean;
};

const UNITS = ['عدد', 'جعبه', 'بسته'];
const NAMES = ['خودکار بیک آبی', 'مدادرنگی آریا ۱۲ رنگ', 'دفتر ۶۰ برگ', 'پاک‌کن سفید', 'خط‌کش ۳۰ سانتی'];
const money = new Intl.NumberFormat('fa-IR');

export const STORY_PRODUCTS: readonly StoryProduct[] = Array.from({ length: 45 }, (_, i) => ({
  id: `p${i + 1}`,
  title: `${NAMES[i % NAMES.length]} مدل ${i + 1}`,
  barcode: String(6261234567890 + i),
  unit: UNITS[i % UNITS.length]!,
  stock: (i * 7) % 23,
  price: 10_000 + i * 2_500,
  brand: i % 2 ? 'آریا' : 'بیک',
  available: (i * 7) % 23 > 0,
}));

export type StorySort = 'title' | 'stock' | 'price';

/** Defined once at module level: a stable column array keeps every row memoized. */
export const STORY_COLUMNS: readonly GridColumn<StoryProduct, StorySort>[] = [
  { id: 'title', header: 'نام کالا', cell: (p) => p.title, sortField: 'title', card: 'title' },
  {
    id: 'status',
    header: 'وضعیت',
    width: 'sm',
    card: 'status',
    cell: (p) => (
      <Badge tone={p.available ? 'success' : 'warning'}>{p.available ? 'موجود' : 'ناموجود'}</Badge>
    ),
  },
  { id: 'unit', header: 'واحد', width: 'xs', cell: (p) => p.unit },
  {
    id: 'stock',
    header: 'موجودی',
    width: 'sm',
    align: 'end',
    sortField: 'stock',
    cell: (p) => money.format(p.stock),
  },
  {
    id: 'price',
    header: 'قیمت فروش (تومان)',
    width: 'md',
    align: 'end',
    sortField: 'price',
    cell: (p) => money.format(p.price),
  },
  { id: 'barcode', header: 'بارکد', width: 'md', card: 'extra', cell: (p) => <bdi dir="ltr">{p.barcode}</bdi> },
  { id: 'brand', header: 'برند', width: 'sm', card: 'extra', cell: (p) => p.brand },
];

export const storySortValue = (p: StoryProduct, field: StorySort) => p[field];
export const storyRowId = (p: StoryProduct) => p.id;
export const storyRowLabel = (p: StoryProduct) => p.title;
export const storyRowHref = (p: StoryProduct) => `#product-${p.id}`;
export const storyRowActions = () => (
  <Button variant="secondary" size="sm">
    جزئیات
  </Button>
);

/** A source frozen in one state (loading, error, empty) for state stories. */
export function frozenSource(status: ListStatus): ListSource<StoryProduct, null, StorySort> {
  const noop = () => undefined;
  const error = status === 'error' ? { kind: 'Server' as const, code: 'UNAVAILABLE', message: '' } : null;
  const shared = { status, items: [], totalCount: 0, isFetching: false, isPlaceholder: false, error, retry: noop };
  return {
    query: { page: 1, pageSize: 20, sort: [], filter: null },
    pageSizeOptions: [10, 20, 50, 100],
    setPage: noop,
    setPageSize: noop,
    setSort: noop,
    applyFilter: noop,
    present: noop,
    refresh: noop,
    pageView: { ...shared, page: 1, pageSize: 20, totalPages: 0 },
    infiniteView: { ...shared, hasNextPage: false, isLoadingMore: false, loadMoreError: null, loadMore: noop },
  };
}
