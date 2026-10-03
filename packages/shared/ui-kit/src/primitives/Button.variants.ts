import { cva } from 'class-variance-authority';

/**
 * Figma `Dukani/Button` (55:10, mobile 48 · px 16) and `Dukani/Button Desktop` (565:95, 40 · px 20): radius md,
 * gap spacing/2, Label/M; Primary/Secondary × Default/Disabled. `md` resolves the viewport density through
 * --dukani-control (one component, no mobile/desktop fork). `lg` = legacy `Dukani/Button` 21:12 (52);
 * `sm` = control/sm 40. Text/Danger from ui-guidelines.
 */
export const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-md px-4 text-label-m whitespace-nowrap select-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-38 aria-disabled:cursor-not-allowed aria-disabled:opacity-38',
  {
    variants: {
      variant: {
        primary:
          'bg-action text-fg-inverse hover:bg-action-hover active:bg-action-pressed disabled:hover:bg-action',
        secondary:
          'border border-line bg-surface text-fg-brand hover:bg-brand-subtle disabled:hover:bg-surface',
        text: 'bg-transparent text-fg-brand hover:bg-brand-subtle disabled:hover:bg-transparent',
        danger: 'bg-danger text-fg-inverse hover:opacity-90',
        'danger-secondary': 'border border-line bg-surface text-danger hover:bg-danger-subtle',
      },
      size: {
        sm: 'h-control-sm px-3',
        md: 'h-control-adaptive desktop:px-5',
        lg: 'h-control',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);
