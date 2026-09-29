import type { ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { Link } from '../primitives/Link';
import type { NavItem } from './BottomNavigation';

/**
 * Figma `Dukani/Navigation Item` (565:54): 44px, padding spacing/3, radius sm, Body/M. Default = text secondary,
 * Hover = bg muted, Active = bg brand-subtle + DemiBold brand text + aria-current (not color only),
 * Disabled = text disabled.
 */
export function NavigationItem({ item, active, disabled, showIcon }: { item: NavItem; active?: boolean; disabled?: boolean; showIcon?: boolean }) {
  const classes = cn(
    'flex h-11 w-full items-center gap-2 rounded-sm p-3 text-body-m transition-colors',
    active ? 'bg-brand-subtle font-semibold text-fg-brand' : 'text-fg-secondary hover:bg-muted hover:text-fg-primary',
    disabled && 'pointer-events-none text-fg-disabled',
  );
  const content = (
    <>
      {showIcon ? <Icon name={item.icon} size={20} className={active ? 'text-fg-brand' : 'text-icon'} /> : null}
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

export type DesktopSidebarProps = {
  items: readonly NavItem[];
  activeId?: string;
  /** Second line under the brand, e.g. «پنل فروشنده» or the active store. */
  workspace?: ReactNode;
  /** Bottom line (Figma «فضای کاری دکانی»), e.g. a store switcher or sign-out. */
  footer?: ReactNode;
  /** Figma rows are text-only; icons help scanning long menus. */
  showIcons?: boolean;
  className?: string;
};

/**
 * Figma `Dukani/Desktop Sidebar` (498:563): 240px (layout/sidebar) on the right in RTL, surface with a border,
 * padding 24/16, brand «دکانی» 24/DemiBold, workspace Body/S secondary, menu of 44px rows with 4px gap.
 */
export function DesktopSidebar({ items, activeId, workspace, footer, showIcons, className }: DesktopSidebarProps) {
  return (
    <aside className={cn('flex h-full w-sidebar shrink-0 flex-col gap-2 border-e border-line bg-surface px-4 py-6', className)}>
      <p className="text-heading-xl font-semibold text-fg-brand">دکانی</p>
      {workspace ? <p className="text-body-s text-fg-secondary">{workspace}</p> : null}
      <nav aria-label="ناوبری اصلی" className="mt-2 min-h-0 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.id}>
              <NavigationItem item={item} active={item.id === activeId} showIcon={showIcons} />
            </li>
          ))}
        </ul>
      </nav>
      {footer ? <div className="text-body-s text-fg-tertiary">{footer}</div> : null}
    </aside>
  );
}
