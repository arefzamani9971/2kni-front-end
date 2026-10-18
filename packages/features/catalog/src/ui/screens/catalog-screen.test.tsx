import { render } from '@dukani/i18n/testing';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider, createDataClient } from '@dukani/data';
import { PERMISSIONS, type ListQuery, type ListViewParams, type PagedResult } from '@dukani/domain';
import {
  ActiveStoreProvider,
  NavigationProvider,
  createMemoryDraftStore,
  type ActiveStore,
} from '@dukani/platform';
import { ViewportProvider } from '@dukani/ui-kit';
import type * as StatusModule from '../components/CatalogItemStatus';
import type { CatalogPort } from '../../application/catalog-port.types';
import type { CatalogItemFilter, CatalogItemSort, CatalogItemSummary } from '../../domain/catalog.types';
import { createCommandJournal } from '../../infrastructure/command-journal';
import { CatalogModuleProvider } from '../../module';
import type { CatalogModule } from '../../module.types';
import { CatalogScreen } from './CatalogScreen';

const statusRenders = vi.hoisted(() => vi.fn());
// Rows are observed through a cell of their own; the grid internals stay untouched.
vi.mock('../components/CatalogItemStatus', async (original) => {
  const actual = await original<typeof StatusModule>();
  return {
    CatalogItemStatus: (props: Parameters<typeof actual.CatalogItemStatus>[0]) => {
      statusRenders(props.item.id);
      return <actual.CatalogItemStatus {...props} />;
    },
  };
});

const TYPE = '0192f000-0000-7000-8000-0000000000aa';
const STORE: ActiveStore = {
  id: 'store-1',
  name: 'دکان',
  storeTypeKey: 'stationery',
  role: 'Owner',
  permissions: [...PERMISSIONS],
};
const item = (id: string, title: string, mine = false): CatalogItemSummary => ({
  id,
  title,
  productTypeId: TYPE,
  productTypeName: 'خودکار',
  brandName: 'بیک',
  baseUnitName: 'عدد',
  keyAttributes: 'آبی',
  status: 'Public',
  myStoreProductId: mine ? 'product-' + id : null,
});
const ITEMS = [item('a', 'خودکار بیک آبی', true), item('b', 'خودکار بیک قرمز'), item('c', 'مداد')];
const pageOf = (items: readonly CatalogItemSummary[]): PagedResult<CatalogItemSummary> => ({
  items,
  page: 1,
  pageSize: 20,
  totalCount: items.length,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
});

type Query = ListQuery<CatalogItemFilter, CatalogItemSort>;

const setup = ({
  viewport = 'desktop' as const,
  store = STORE,
  initialQuery = '',
  initialView = {},
  onSelectItem = vi.fn(async () => {}),
}: {
  viewport?: 'desktop' | 'mobile';
  store?: ActiveStore;
  initialQuery?: string;
  initialView?: ListViewParams;
  onSelectItem?: (id: string, storeProductId: string | null) => Promise<void>;
} = {}) => {
  const itemPage = vi.fn(async (_store: string, query: Query) =>
    pageOf(ITEMS.filter((i) => i.title.includes(query.filter.q))),
  );
  const nav = { push: vi.fn(), replace: vi.fn(), replaceUrl: vi.fn(), back: vi.fn() };
  const module = {
    catalog: {
      itemPage,
      types: async () => [
        {
          id: TYPE,
          name: 'خودکار',
          categoryId: null,
          categoryName: null,
          status: 'Public',
          attributeCount: 0,
        },
      ],
    } as unknown as CatalogPort,
    corrections: {} as CatalogModule['corrections'],
    journal: createCommandJournal(createMemoryDraftStore(), () => 'user'),
    editors: {} as CatalogModule['editors'],
  } satisfies CatalogModule;
  render(
    <DataProvider client={createDataClient()}>
      <NavigationProvider value={nav}>
        <ActiveStoreProvider value={store}>
          <CatalogModuleProvider value={module}>
            <ViewportProvider forced={viewport}>
              <CatalogScreen
                initialQuery={initialQuery}
                initialView={initialView}
                onSelectItem={onSelectItem}
              />
            </ViewportProvider>
          </CatalogModuleProvider>
        </ActiveStoreProvider>
      </NavigationProvider>
    </DataProvider>,
  );
  return { itemPage, nav, onSelectItem };
};

beforeEach(() => statusRenders.mockClear());

describe('catalog list (F07) on useAppList + DataGrid', () => {
  it('desktop: one page request with the URL filter, title sort and a pager-ready table', async () => {
    const { itemPage } = setup({ initialQuery: 'خودکار' });
    await screen.findByText('خودکار بیک قرمز');
    const table = screen.getByRole('table', { name: 'فهرست کاتالوگ' });
    expect(within(table).getAllByRole('row')).toHaveLength(3); // header + two matches
    expect(within(table).getByRole('columnheader', { name: 'وضعیت' })).toBeInTheDocument();
    expect(itemPage).toHaveBeenCalledTimes(1);
    expect(itemPage.mock.calls[0]?.[1]).toEqual({
      page: 1,
      pageSize: 20,
      sort: [{ field: 'title', direction: 'asc' }],
      filter: { q: 'خودکار', productTypeId: null },
    });
    expect(within(table).getByText('در فروشگاه من')).toBeInTheDocument();
    expect(within(table).getByText('بدون قیمت و موجودی')).toBeInTheDocument();
    expect(within(table).getAllByText('خودکار · بیک · آبی · عدد')).toHaveLength(2);
  });

  it('typing is only a draft: no request and no row render until Enter applies it', async () => {
    const user = userEvent.setup();
    const { itemPage, nav } = setup();
    await screen.findByText('مداد');
    statusRenders.mockClear();
    const field = screen.getByRole('searchbox', { name: 'جست‌وجوی کالا' });
    await user.type(field, 'مداد');
    expect(itemPage).toHaveBeenCalledTimes(1);
    expect(statusRenders).not.toHaveBeenCalled();
    expect(nav.replaceUrl).not.toHaveBeenCalledWith(expect.stringContaining('q='));
    await user.keyboard('{Enter}');
    await waitFor(() => expect(itemPage).toHaveBeenCalledTimes(2));
    expect(itemPage.mock.calls[1]?.[1].filter).toEqual({ q: 'مداد', productTypeId: null });
    // the address only, without a navigation
    expect(nav.replaceUrl).toHaveBeenLastCalledWith('/s/store-1/catalog?q=%D9%85%D8%AF%D8%A7%D8%AF');
    expect(nav.replace).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('خودکار بیک قرمز')).not.toBeInTheDocument());
  });

  it('a type chip applies at once and leaves the unapplied text in the field', async () => {
    const user = userEvent.setup();
    const { itemPage, nav } = setup();
    await screen.findByText('مداد');
    await user.type(screen.getByRole('searchbox', { name: 'جست‌وجوی کالا' }), 'قرمز');
    await user.click(await screen.findByRole('button', { name: 'خودکار' }));
    await waitFor(() => expect(itemPage).toHaveBeenCalledTimes(2));
    expect(itemPage.mock.calls[1]?.[1].filter).toEqual({ q: '', productTypeId: TYPE });
    expect(nav.replaceUrl).toHaveBeenLastCalledWith(`/s/store-1/catalog?productTypeId=${TYPE}`);
    expect(screen.getByRole('searchbox', { name: 'جست‌وجوی کالا' })).toHaveValue('قرمز');
  });

  it('return context: page, size and sort come from the address and go back to it as they change', async () => {
    const user = userEvent.setup();
    const { itemPage, nav } = setup({
      initialQuery: 'خودکار',
      initialView: { page: '2', size: '50', sort: '-title' },
    });
    await waitFor(() => expect(itemPage).toHaveBeenCalled());
    expect(itemPage.mock.calls[0]?.[1]).toMatchObject({
      page: 2,
      pageSize: 50,
      sort: [{ field: 'title', direction: 'desc' }],
    });
    expect(nav.replaceUrl).toHaveBeenLastCalledWith(
      '/s/store-1/catalog?q=%D8%AE%D9%88%D8%AF%DA%A9%D8%A7%D8%B1&page=2&size=50&sort=-title',
    );
    // a new sort starts again at page 1; descending → none is the endpoint's own title order
    const table = await screen.findByRole('table', { name: 'فهرست کاتالوگ' });
    const sortTitle = within(within(table).getAllByRole('columnheader')[0]!).getByRole('button');
    await user.click(sortTitle);
    await waitFor(() =>
      expect(nav.replaceUrl).toHaveBeenLastCalledWith(
        '/s/store-1/catalog?q=%D8%AE%D9%88%D8%AF%DA%A9%D8%A7%D8%B1&size=50',
      ),
    );
    expect(nav.push).not.toHaveBeenCalled();
  });

  it('an address value the list does not offer falls back to its default and is written back plain', async () => {
    const { itemPage, nav } = setup({ initialView: { page: '-3', size: '37', sort: 'price' } });
    await waitFor(() => expect(itemPage).toHaveBeenCalled());
    expect(itemPage.mock.calls[0]?.[1]).toMatchObject({
      page: 1,
      pageSize: 20,
      sort: [{ field: 'title', direction: 'asc' }],
    });
    expect(nav.replaceUrl).toHaveBeenLastCalledWith('/s/store-1/catalog');
  });

  it('121 characters stay in the field with an error and are never sent (F07-S02)', async () => {
    const { itemPage } = setup();
    await screen.findByText('مداد');
    const field = screen.getByRole('searchbox', { name: 'جست‌وجوی کالا' });
    fireEvent.change(field, { target: { value: 'x'.repeat(121) } });
    fireEvent.submit(field.closest('form')!);
    expect(await screen.findByText('عبارت جست‌وجو حداکثر ۱۲۰ نویسه دارد.')).toBeInTheDocument();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(field, { target: { value: 'x'.repeat(120) } });
    fireEvent.submit(field.closest('form')!);
    await waitFor(() => expect(itemPage).toHaveBeenCalledTimes(2));
  });

  it('opens one row at a time without re-rendering the rows; a failure is shown above the list', async () => {
    const user = userEvent.setup();
    let finish: (value?: unknown) => void = () => {};
    const onSelectItem = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          finish = reject;
        }),
    );
    setup({ onSelectItem });
    const buttons = await screen.findAllByRole('button', { name: /^جزئیات کاتالوگ/ });
    // the accessible name tells the rows apart (Figma 358:5348)
    expect(buttons[0]).toHaveAccessibleName('جزئیات کاتالوگ خودکار بیک آبی');
    statusRenders.mockClear();
    await user.click(buttons[0]!);
    await user.click(buttons[1]!);
    expect(onSelectItem).toHaveBeenCalledTimes(1);
    expect(onSelectItem).toHaveBeenCalledWith('a', 'product-a');
    expect(buttons[1]).toBeDisabled();
    await act(async () => finish(new Error('offline')));
    expect(await screen.findByText('باز کردن کالا انجام نشد. دوباره تلاش کنید.')).toBeInTheDocument();
    expect(buttons[1]).toBeEnabled();
    expect(statusRenders).not.toHaveBeenCalled();
  });

  it('without product.manage the rows stay readable and have no entry action', async () => {
    setup({ store: { ...STORE, role: 'Staff', permissions: [] } });
    await screen.findByText('مداد');
    expect(screen.queryByRole('button', { name: /^جزئیات کاتالوگ/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ثبت کاتالوگ' })).not.toBeInTheDocument();
  });

  it('mobile: the same query as cards, one request', async () => {
    const { itemPage } = setup({ viewport: 'mobile' });
    expect(await screen.findByRole('article', { name: 'مداد' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(itemPage).toHaveBeenCalledTimes(1);
  });
});
