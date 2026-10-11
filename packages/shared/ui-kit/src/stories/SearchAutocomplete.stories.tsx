import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchAutocomplete } from '../fields/SearchAutocomplete';
const meta: Meta<typeof SearchAutocomplete> = {
  title: 'Fields/SearchAutocomplete',
  component: SearchAutocomplete,
};
export default meta;
export const Default: StoryObj<typeof SearchAutocomplete> = {
  args: {
    label: 'Search products',
    value: 'Pen',
    onChange() {},
    onSelect() {},
    suggestions: [{ id: 'pen', label: 'Blue pen', description: 'Box of 20' }],
  },
};
