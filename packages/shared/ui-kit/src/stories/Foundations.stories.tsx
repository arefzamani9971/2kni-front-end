import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text, type TextVariant } from '../primitives/Text';

/** Mirrors Figma page «00 — Foundations» → Complete Token Catalog (492:2). */
const meta: Meta = { title: 'Foundations/Tokens' };
export default meta;

/** Figma `Dukani/Semantic` color variables → CSS var. */
const SEMANTIC = [
  'bg/canvas', 'bg/surface', 'bg/elevated', 'bg/muted', 'bg/disabled', 'bg/brand', 'bg/brand-strong', 'bg/brand-subtle',
  'bg/success-subtle', 'bg/warning-subtle', 'bg/danger-subtle',
  'text/primary', 'text/secondary', 'text/tertiary', 'text/disabled', 'text/inverse', 'text/brand', 'text/success',
  'border/default', 'border/strong', 'border/focus', 'border/danger',
  'icon/default', 'icon/inverse', 'icon/brand',
  'status/success', 'status/warning', 'status/danger', 'status/info',
  'action/primary', 'action/primary-hover', 'action/primary-pressed', 'action/disabled',
  'overlay/scrim',
] as const;

const cssVar = (name: string) => `var(--dukani-color-${name.replace('/', '-')})`;

export const Colors: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SEMANTIC.map((name) => (
        <div key={name} className="flex flex-col gap-2 rounded-md border border-line bg-surface p-2">
          <div className="h-14 rounded-sm border border-line" style={{ background: cssVar(name) }} />
          <code className="text-caption" dir="ltr">color/{name}</code>
        </div>
      ))}
    </div>
  ),
};

const MODE_SWATCHES = ['bg/brand', 'bg/brand-strong', 'bg/brand-subtle', 'bg/muted', 'text/brand', 'border/strong', 'border/focus', 'action/primary-pressed', 'status/info'] as const;

/** Figma modes Shop Light / Customer Light / Admin Light — set by `data-theme` on the app root. */
export const ThemeModes: StoryObj = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        ['shop', 'فروشنده · Teal'],
        ['customer', 'مشتری · Indigo'],
        ['admin', 'ادمین · Slate'],
      ].map(([theme, title]) => (
        <div key={theme} data-theme={theme} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
          <Text variant="heading-m">{title}</Text>
          <div className="grid grid-cols-3 gap-2">
            {MODE_SWATCHES.map((name) => (
              <div key={name} className="flex flex-col gap-1">
                <div className="h-10 rounded-sm border border-line" style={{ background: cssVar(name) }} />
                <code className="text-[10px] text-fg-secondary" dir="ltr">{name}</code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Figma text styles (13) + code-only `caption`. */
const STYLES: [TextVariant, string][] = [
  ['display-l', 'Bold 32/48'], ['heading-xl', 'Bold 24/36'], ['heading-l', 'DemiBold 20/30'], ['heading-m', 'DemiBold 18/28'],
  ['heading-s', 'DemiBold 16/26'], ['body-l', 'Regular 16/26'], ['body-m', 'Regular 14/22'], ['body-s', 'Regular 12/19'],
  ['label-l', 'Medium 16/24'], ['label-m', 'Medium 14/22'], ['label-s', 'Medium 12/18'], ['numeric-l', 'DemiBold 24/36'],
  ['numeric-m', 'DemiBold 18/28'], ['caption', 'Regular 11/16 · code-only'],
];

export const Typography: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      {STYLES.map(([v, spec]) => (
        <div key={v} className="flex items-baseline gap-4 border-b border-line pb-2">
          <code className="w-40 shrink-0 text-caption text-fg-secondary" dir="ltr">{v} · {spec}</code>
          <Text variant={v} as="p">ثبت سریع کالا، ساده و مطمئن ۱۲۳۴۵</Text>
        </div>
      ))}
    </div>
  ),
};

const SPACING = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
const RADIUS = [['sm', 8], ['md', 12], ['lg', 16], ['xl', 20], ['full', 999]] as const;
const CONTROLS = [['control/sm', 'h-control-sm', 40], ['control/md', 'h-control', 52], ['control/lg', 'h-control-lg', 56], ['touch/min', 'h-touch', 44]] as const;

export const Size: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {SPACING.map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className="h-3 bg-brand" style={{ width: `var(--dukani-spacing-${s})` }} />
            <code className="text-caption" dir="ltr">spacing/{s} · {s * 4}px</code>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {RADIUS.map(([r, px]) => (
          <div key={r} className="flex flex-col items-center gap-2">
            <div className="size-18 border border-line bg-brand-subtle" style={{ borderRadius: `var(--dukani-radius-${r})` }} />
            <code className="text-caption" dir="ltr">radius/{r} · {px}</code>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-4">
        {CONTROLS.map(([name, cls, px]) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div className={`${cls} w-24 rounded-md border border-line bg-surface`} />
            <code className="text-caption" dir="ltr">{name} · {px}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Elevation: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-6 bg-canvas p-6">
      {['shadow-subtle', 'shadow-medium', 'shadow-strong'].map((s) => (
        <div key={s} className={`flex size-32 items-end rounded-lg bg-surface p-3 ${s}`}>
          <code className="text-caption" dir="ltr">{s.replace('shadow-', 'Shadow/')}</code>
        </div>
      ))}
    </div>
  ),
};
