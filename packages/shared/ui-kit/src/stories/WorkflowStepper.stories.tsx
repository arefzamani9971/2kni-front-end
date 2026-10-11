import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkflowStepper } from '../patterns/WorkflowStepper';
const meta: Meta<typeof WorkflowStepper> = { title: 'Patterns/WorkflowStepper', component: WorkflowStepper };
export default meta;
export const Details: StoryObj<typeof WorkflowStepper> = {
  args: { steps: ['Details', 'Units and packages', 'Sale price'], current: 0, label: 'Product registration' },
};
export const Pricing: StoryObj<typeof WorkflowStepper> = {
  args: { steps: ['Details', 'Units and packages', 'Sale price'], current: 2, label: 'Product registration' },
};
