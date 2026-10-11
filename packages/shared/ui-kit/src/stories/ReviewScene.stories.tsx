import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReviewScene } from '../overlays/ReviewScene';
import { Button } from '../primitives/Button';
const meta: Meta<typeof ReviewScene> = { title: 'Overlays/ReviewScene', component: ReviewScene };
export default meta;
export const Open: StoryObj<typeof ReviewScene> = {
  args: {
    open: true,
    onOpenChange() {},
    title: 'Review receipt',
    children: 'All rows commit together.',
    actions: <Button>Confirm receipt</Button>,
  },
};
