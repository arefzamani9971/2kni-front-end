import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { buttonVariants, type ButtonProps } from './Button';
import { Link } from './Link';

/** A link styled as a button (Figma «Action / …» that navigates). Uses the app's router link. */
export function ButtonLink({
  href,
  variant = 'secondary',
  size,
  block = true,
  iconStart,
  iconEnd,
  className,
  children,
}: Pick<ButtonProps, 'variant' | 'size' | 'block' | 'iconStart' | 'iconEnd' | 'className' | 'children'> & { href: string }) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size, block }), className)}>
      {iconStart ? <Icon name={iconStart} size={20} /> : null}
      {children}
      {iconEnd ? <Icon name={iconEnd} size={20} /> : null}
    </Link>
  );
}
