import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { Link } from '../primitives/Link';
import type { NavItem } from './BottomNavigation.types';

/**
 * Figma `Dukani/Navigation Item` (565:54): 44px, padding spacing/3, radius sm, Body/M. Default = text secondary,
 * Hover = bg muted, Active = bg brand-subtle + DemiBold brand text + aria-current (not color only),
 * Disabled = text disabled.
 */
export function NavigationItem({
  item,
  active,
  disabled,
  showIcon,
}: {
  item: NavItem;
  active?: boolean;
  disabled?: boolean;
  showIcon?: boolean;
}) {
  const classes = cn(
    'flex h-11 w-full items-center gap-2 rounded-sm p-3 text-body-m transition-colors',
    active
      ? 'bg-brand-subtle font-semibold text-fg-brand'
      : 'text-fg-secondary hover:bg-muted hover:text-fg-primary',
    disabled && 'pointer-events-none text-fg-disabled',
  );
  const content = (
    <>
      {showIcon ? (
        <Icon name={item.icon} size={20} className={active ? 'text-fg-brand' : 'text-icon'} />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </>
  );
  if (disabled) {
    return (
      <span aria-disabled className={classes}>
        {content}
      </span>
    );
  }
  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined} className={classes}>
      {content}
    </Link>
  );
}
