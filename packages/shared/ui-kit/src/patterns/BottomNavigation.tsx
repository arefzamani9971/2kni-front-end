import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { Link } from '../primitives/Link';
import type { NavItem } from './BottomNavigation.types';

/**
 * Figma `Bottom Navigation` (123:2): 76px bar, top border, items 56×56 with 22px icon and 12/Medium
 * label; the active item is brand-colored and marked with aria-current (not color only).
 */
export function BottomNavigation({
  items,
  activeId,
  className,
}: {
  items: readonly NavItem[];
  activeId?: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="ناوبری اصلی"
      className={cn('pb-safe border-line bg-surface w-full border-t px-4 pt-2', className)}
    >
      <ul className="flex h-15 items-center justify-between">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'text-label-s flex size-14 flex-col items-center justify-center gap-1 rounded-md',
                  active ? 'text-fg-brand' : 'text-fg-secondary hover:text-fg-primary',
                )}
              >
                <Icon name={item.icon} size={22} className={active ? 'text-fg-brand' : 'text-icon'} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
