import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecordCard } from '../patterns/RecordCard';
const meta: Meta<typeof RecordCard> = { title: 'Patterns/RecordCard', component: RecordCard };
export default meta;
export const ProductType: StoryObj<typeof RecordCard> = {
  args: {
    title: 'Pen',
    subtitle: 'Product type',
    description: 'Ink color · Tip size',
    href: '/catalog/type',
  },
};
