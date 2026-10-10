import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChoiceScene } from '../overlays/ChoiceScene';
import { Button } from '../primitives/Button';
import { SearchField } from '../fields/SearchField';
const meta: Meta<typeof ChoiceScene> = { title: 'Overlays/ChoiceScene', component: ChoiceScene };
export default meta;
export const BrandSelection: StoryObj<typeof ChoiceScene> = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Select brand',
    children: <SearchField label="Brand" />,
    primaryAction: <Button>Select BIC</Button>,
    secondaryAction: <Button variant="secondary">Add brand</Button>,
    alternatives: [
      { id: 'none', label: 'No brand', marker: 'tag', onSelect: () => {} },
      { id: 'unknown', label: 'Brand unknown', marker: 'warning', onSelect: () => {} },
    ],
  },
};
