import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';

import type { DesktopSidebarProps } from './DesktopSidebar.types';
import { NavigationItem } from './NavigationItem';

/**
 * Figma `Dukani/Desktop Sidebar` (498:563): 240px (layout/sidebar) on the right in RTL, surface with a border,
 * padding 24/16, wordmark 1036:846 in its preserved 36px slot, workspace Body/S, 44px navigation rows.
 */
export function DesktopSidebar({
  items,
  activeId,
  workspace,
  footer,
  showIcons,
  className,
}: DesktopSidebarProps) {
  const t = useUiTranslations();

  return (
    <aside
      className={cn(
        'w-sidebar border-line bg-surface flex h-full shrink-0 flex-col gap-2 border-e px-4 py-6',
        className,
      )}
    >
      <div
        className="relative h-9 w-[101.388px] shrink-0 overflow-hidden"
        role="img"
        aria-label={t('controls.brand')}
      >
        <img
          src={new URL('./assets/dukani-wordmark.png', import.meta.url).href}
          alt=""
          className="pointer-events-none absolute top-[-61.22%] left-[-20.83%] h-[261.22%] w-[139.13%] max-w-none"
          aria-hidden="true"
        />
      </div>
      {workspace ? <p className="text-body-s text-fg-secondary">{workspace}</p> : null}
      {items.length ? (
        <nav aria-label={t('controls.mainNav')} className="mt-2 min-h-0 flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <NavigationItem
                  item={item}
                  active={item.id === activeId}
                  disabled={item.disabled}
                  showIcon={showIcons}
                />
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        // Figma «Sidebar / Auth branding» (566:21231): brand only before sign-in
        <div className="flex-1" />
      )}
      {footer ? <div className="text-body-s text-fg-tertiary">{footer}</div> : null}
    </aside>
  );
}
