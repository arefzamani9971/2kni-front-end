import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecordList } from '../patterns/RecordList';
import { ProductDataRow } from '../patterns/ProductDataRow';
const meta: Meta<typeof RecordList> = { title: 'Patterns/RecordList', component: RecordList };
export default meta;
export const Catalog: StoryObj<typeof RecordList> = {
  args: {
    label: 'Catalog',
    columns: ['Title', 'Description', 'Status'],
    rows: [
      {
        id: 'pen',
        card: <ProductDataRow title="Pen" subtitle="Public information" />,
        cells: ['Pen', 'Public information', 'Public'],
      },
    ],
  },
};
