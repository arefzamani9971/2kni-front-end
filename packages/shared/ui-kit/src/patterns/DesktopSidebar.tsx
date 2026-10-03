import { cn } from '../lib/cn';

import type { DesktopSidebarProps } from './DesktopSidebar.types';
import { NavigationItem } from './NavigationItem';

/**
 * Figma `Dukani/Desktop Sidebar` (498:563): 240px (layout/sidebar) on the right in RTL, surface with a border,
 * padding 24/16, brand «دکانی» 24/DemiBold, workspace Body/S secondary, menu of 44px rows with 4px gap.
 */
export function DesktopSidebar({
  items,
  activeId,
  workspace,
  footer,
  showIcons,
  className,
}: DesktopSidebarProps) {
  return (
    <aside
      className={cn(
        'w-sidebar border-line bg-surface flex h-full shrink-0 flex-col gap-2 border-e px-4 py-6',
        className,
      )}
    >
      <p className="text-heading-xl text-fg-brand font-semibold">دکانی</p>
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
