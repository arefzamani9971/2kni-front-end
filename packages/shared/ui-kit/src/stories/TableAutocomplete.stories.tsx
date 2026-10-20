import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableAutocomplete } from '../fields/TableAutocomplete';
import type { AutocompleteStatus, TableAutocompleteProps } from '../fields/TableAutocomplete.types';
import { ViewportProvider } from '../responsive/viewport';

type Product = { id: string; title: string; barcode: string | null; price: string | null };
const products: Product[] = [
  {
    id: '1',
    title: 'خودکار بیک آبی · جعبهٔ ۵۰ عددی با نام بسیار بلند برای آزمون شکست خط',
    barcode: '6261234567890',
    price: '۱۰٬۰۰۰ تومان',
  },
  { id: '2', title: 'دفتر ۶۰ برگ', barcode: null, price: null },
];
const base: TableAutocompleteProps<Product> = {
  label: 'جست‌وجوی کالا',
  query: 'خودکار',
  onQueryChange() {},
  items: products,
  getItemKey: (p) => p.id,
  getItemLabel: (p) => p.title,
  columns: [
    { key: 'title', header: 'کالا', render: (p) => p.title, width: 'minmax(0,2fr)' },
    { key: 'barcode', header: 'بارکد', render: (p) => <bdi>{p.barcode ?? '—'}</bdi> },
    { key: 'price', header: 'قیمت فروش', render: (p) => p.price ?? 'قیمت ثبت نشده', align: 'end' },
  ],
  onSelect() {},
  status: 'results',
};
const meta: Meta<typeof TableAutocomplete<Product>> = {
  title: 'Fields/TableAutocomplete',
  component: TableAutocomplete<Product>,
  argTypes: {
    status: {
      control: 'select',
      options: [
        'belowMinimum',
        'debouncing',
        'loading',
        'results',
        'empty',
        'error',
      ] satisfies AutocompleteStatus[],
    },
  },
};
export default meta;
type Story = StoryObj<typeof TableAutocomplete<Product>>;
export const Desktop: Story = {
  args: base,
  render: (args) => (
    <ViewportProvider forced="desktop">
      <TableAutocomplete {...args} />
    </ViewportProvider>
  ),
};
export const MobileFullscreen: Story = {
  args: base,
  render: (args) => (
    <ViewportProvider forced="mobile">
      <TableAutocomplete {...args} />
    </ViewportProvider>
  ),
};
export const ErrorWithRetry: Story = {
  ...Desktop,
  args: { ...base, items: [], status: 'error', onRetry() {} },
};
export const BelowMinimum: Story = {
  ...Desktop,
  args: { ...base, query: 'خو', items: [], status: 'belowMinimum' },
};
