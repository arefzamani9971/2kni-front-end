import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from '../patterns/PageHeader';
import { Button } from '../primitives/Button';
const meta: Meta<typeof PageHeader> = { title: 'Patterns/PageHeader', component: PageHeader };
export default meta;
export const Catalog: StoryObj<typeof PageHeader> = {
  args: { title: 'Catalog', subtitle: 'Dukani · Store', back: () => {}, actions: <Button>Add item</Button> },
};
