import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';
import { Slot } from '../lib/slot';
import { Spinner } from './Spinner';

/**
 * Figma `Production/Button` (494:7): 48px, radius md, px spacing/4, gap spacing/2, Label/M; Primary/Secondary ×
 * Default/Disabled. `lg` = legacy `Dukani/Button` (21:12, control/md 52); `sm` = control/sm 40. Text/Danger from ui-guidelines.
 */
export const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-md px-4 text-label-m whitespace-nowrap select-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-38 aria-disabled:cursor-not-allowed aria-disabled:opacity-38',
  {
    variants: {
      variant: {
        primary: 'bg-action text-fg-inverse hover:bg-action-hover active:bg-action-pressed disabled:hover:bg-action',
        secondary: 'border border-line bg-surface text-fg-brand hover:bg-brand-subtle disabled:hover:bg-surface',
        text: 'bg-transparent text-fg-brand hover:bg-brand-subtle disabled:hover:bg-transparent',
        danger: 'bg-danger text-fg-inverse hover:opacity-90',
        'danger-secondary': 'border border-line bg-surface text-danger hover:bg-danger-subtle',
      },
      size: {
        sm: 'h-control-sm px-3',
        md: 'h-12',
        lg: 'h-control',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Keeps the width and label while a request runs; the button is disabled meanwhile. */
    loading?: boolean;
    iconStart?: IconName;
    iconEnd?: IconName;
    /** Render the child element (e.g. a Link) with button styles. */
    asChild?: boolean;
    ref?: Ref<HTMLButtonElement>;
    children?: ReactNode;
  };

export function Button({
  variant,
  size,
  block,
  loading = false,
  iconStart,
  iconEnd,
  asChild = false,
  className,
  disabled,
  type,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, block }), className);
  if (asChild) {
    return (
      <Slot.Root className={classes} {...rest}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={20} />
        </span>
      ) : null}
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
        {iconStart ? <Icon name={iconStart} size={20} /> : null}
        {children}
        {iconEnd ? <Icon name={iconEnd} size={20} /> : null}
      </span>
    </button>
  );
}
