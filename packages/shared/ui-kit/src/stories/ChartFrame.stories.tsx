import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChartFrame } from '../patterns/ChartFrame';
import { MiniBarChart } from '../patterns/MiniBarChart';

/** Every chart sits in `ChartFrame`: title, states, and the data as an accessible table (Figma home 312:8718). */
const meta: Meta<typeof ChartFrame> = { title: 'Patterns/ChartFrame', component: ChartFrame };
export default meta;

const WEEK = [
  { label: 'شنبه', value: 12, display: '۱۲٬۰۰۰' },
  { label: 'یکشنبه', value: 18, display: '۱۸٬۰۰۰' },
  { label: 'دوشنبه', value: 9, display: '۹٬۰۰۰' },
  { label: 'سه‌شنبه', value: 22, display: '۲۲٬۰۰۰' },
];

export const WeekSales: StoryObj<typeof ChartFrame> = {
  args: {
    title: 'روند فروش هفته',
    description: 'مبالغ به هزار تومان',
    data: WEEK,
    valueLabel: 'فروش (هزار تومان)',
    children: <MiniBarChart label="روند فروش هفته" data={WEEK} />,
  },
};
export const Loading: StoryObj<typeof ChartFrame> = {
  args: { title: 'روند فروش هفته', data: [], status: 'loading', children: null },
};
export const Empty: StoryObj<typeof ChartFrame> = {
  args: { title: 'روند فروش هفته', data: [], children: null },
};
export const Failed: StoryObj<typeof ChartFrame> = {
  args: { title: 'روند فروش هفته', data: [], status: 'error', onRetry: () => undefined, children: null },
};
