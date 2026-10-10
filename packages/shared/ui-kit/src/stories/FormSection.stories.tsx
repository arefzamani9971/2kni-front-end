import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormSection } from '../patterns/FormSection';
import { TextField } from '../fields/TextField';
const meta: Meta<typeof FormSection> = { title: 'Patterns/FormSection', component: FormSection };
export default meta;
export const Optional: StoryObj<typeof FormSection> = {
  args: { title: 'Optional details', children: <TextField label="Model" optional /> },
};
