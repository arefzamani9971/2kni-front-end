import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormScene } from '../overlays/FormScene';
import { Button } from '../primitives/Button';
import { TextField } from '../fields/TextField';
const meta: Meta<typeof FormScene> = { title: 'Overlays/FormScene', component: FormScene };
export default meta;
export const BrandForm: StoryObj<typeof FormScene> = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Add brand',
    children: <TextField label="Brand name" required />,
    actions: <Button>Save and select brand</Button>,
  },
};
