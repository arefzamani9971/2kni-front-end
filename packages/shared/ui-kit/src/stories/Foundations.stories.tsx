import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text, type TextVariant } from '../primitives/Text';

const meta: Meta = { title: 'Foundations/Tokens' };
export default meta;

const COLORS: [string, string][] = [
  ['bg/canvas', 'bg-canvas'],
  ['bg/surface', 'bg-surface'],
  ['bg/brand', 'bg-brand'],
  ['bg/brand-subtle', 'bg-brand-subtle'],
  ['bg/danger-subtle', 'bg-danger-subtle'],
  ['bg/warning-subtle', 'bg-warning-subtle'],
  ['bg/success-subtle', 'bg-success-subtle'],
  ['text/primary', 'bg-fg-primary'],
  ['text/secondary', 'bg-fg-secondary'],
  ['text/brand', 'bg-fg-brand'],
  ['border/default', 'bg-line'],
  ['border/focus', 'bg-focus'],
  ['status/success', 'bg-success'],
  ['status/warning', 'bg-warning'],
  ['status/danger', 'bg-danger'],
  ['status/info', 'bg-info'],
];

export const Colors: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {COLORS.map(([name, cls]) => (
        <div key={name} className="flex flex-col gap-2 rounded-md border border-line bg-surface p-2">
          <div className={`h-14 rounded-sm border border-line ${cls}`} />
          <code className="text-caption" dir="ltr">color/{name}</code>
        </div>
      ))}
    </div>
  ),
};

const STYLES: TextVariant[] = ['heading-xl', 'heading-l', 'heading-m', 'heading-s', 'body-l', 'body-m', 'body-s', 'label-l', 'label-m', 'label-s', 'caption', 'numeric-l', 'numeric-m'];

export const Typography: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      {STYLES.map((v) => (
        <div key={v} className="flex items-baseline gap-4 border-b border-line pb-2">
          <code className="w-28 shrink-0 text-caption text-fg-secondary" dir="ltr">{v}</code>
          <Text variant={v} as="p">ثبت سریع کالا، ساده و مطمئن ۱۲۳۴۵</Text>
        </div>
      ))}
    </div>
  ),
};

export const SpacingAndRadius: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 6, 8].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className="h-3 bg-brand" style={{ width: s * 4 }} />
            <code className="text-caption" dir="ltr">spacing/{s} · {s * 4}px</code>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        {['rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-full'].map((r) => (
          <div key={r} className="flex flex-col items-center gap-2">
            <div className={`size-18 border border-line bg-brand-subtle ${r}`} />
            <code className="text-caption" dir="ltr">{r}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};
