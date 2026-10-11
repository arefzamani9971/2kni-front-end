import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetricSummary } from '../patterns/MetricSummary';
const meta: Meta<typeof MetricSummary> = { title: 'Patterns/MetricSummary', component: MetricSummary };
export default meta;
export const Receipt: StoryObj<typeof MetricSummary> = {
  args: {
    label: 'Receipt summary',
    avatarLabel: 'R',
    description: 'All rows commit together.',
    metrics: [
      { id: 'rows', text: '2 rows ready', icon: 'check-circle', tone: 'brand' },
      { id: 'stock', text: '84 pieces', icon: 'products' },
      { id: 'amount', text: '1,800,000 toman', icon: 'receipt', tone: 'warning' },
    ],
  },
};
