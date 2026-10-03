import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { Slot } from '../lib/slot';
import { Spinner } from './Spinner';
import type { ButtonProps } from './Button.types';
import { buttonVariants } from './Button.variants';

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
