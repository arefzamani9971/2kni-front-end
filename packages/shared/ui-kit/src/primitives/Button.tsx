import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
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
  className,
  disabled,
  type,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, block }), className);
  const blocked = disabled || loading || rest['aria-disabled'] === true || rest['aria-disabled'] === 'true';
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={classes}
      disabled={blocked}
      {...rest}
      aria-busy={loading || rest['aria-busy']}
    >
      {loading ? (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <Spinner size={20} />
        </span>
      ) : null}
      <span className={cn('inline-flex items-center gap-2', loading && 'opacity-0')}>
        {iconStart ? <Icon name={iconStart} size={20} /> : null}
        {children}
        {iconEnd ? <Icon name={iconEnd} size={20} /> : null}
      </span>
    </button>
  );
}
