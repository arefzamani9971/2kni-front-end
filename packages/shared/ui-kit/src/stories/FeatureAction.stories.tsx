import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureAction } from '../patterns/FeatureAction';
const meta: Meta<typeof FeatureAction> = { title: 'Patterns/FeatureAction', component: FeatureAction };
export default meta;
export const Brand: StoryObj<typeof FeatureAction> = {
  args: { label: 'Select or add a brand', kind: 'brand', onClick: () => {} },
};
export const Image: StoryObj<typeof FeatureAction> = {
  args: { label: 'Product images (optional)', kind: 'image', onClick: () => {} },
};
export const WithIcon: StoryObj<typeof FeatureAction> = {
  args: { label: 'Store name and note', icon: 'edit', onClick: () => {} },
};
