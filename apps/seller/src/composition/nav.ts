import type { AppTranslator } from '../i18n/types';
import { sellerRoutes } from '@dukani/routes';
import type { NavItem } from '@dukani/ui-kit';
import { SELLER_SIDEBAR } from './nav.constants';
import type { SellerSidebarItem, SellerTab } from './nav.types';

/** Bottom navigation of Figma page 17: خانه، کالاها، مشتریان، گزارش‌ها، بیشتر. */
export const sellerNav = (storeId: string, t: AppTranslator): NavItem[] => [
  { id: 'home', label: t('home'), icon: 'home', href: sellerRoutes.store.home(storeId) },
  { id: 'products', label: t('products'), icon: 'products', href: sellerRoutes.products.list(storeId) },
  { id: 'customers', label: t('customers'), icon: 'customers', href: sellerRoutes.store.customers(storeId) },
  { id: 'reports', label: t('reports'), icon: 'reports', href: sellerRoutes.store.reports(storeId) },
  { id: 'more', label: t('more'), icon: 'more', href: sellerRoutes.store.more(storeId) },
];

/** Desktop navigation uses the current Figma design order and existing route builders. */
export const sellerSidebar = (storeId: string, t: AppTranslator): NavItem[] =>
  SELLER_SIDEBAR.map((item) => ({
    id: item.id,
    label: t(item.label),
    icon: item.icon,
    href: item.href(storeId),
  }));

/**
 * Before a store exists (storeselect, setup — Figma 358:5343, 312:201) the same rows are shown but disabled:
 * every destination needs a store id, and none is active.
 */
export const preStoreSidebar = (t: AppTranslator): NavItem[] =>
  sellerSidebar('_', t).map((item) => ({ ...item, href: '#', disabled: true }));

/** Active tab from the URL: flows keep the tab they belong to (entry → home, like Figma). */
export const activeTab = (pathname: string): SellerTab => {
  const section = pathname.split('/')[3] ?? 'home';
  switch (section) {
    case 'products':
    case 'inventory':
      return 'products';
    case 'customers':
    case 'debts':
    case 'credit':
      return 'customers';
    case 'reports':
      return 'reports';
    // destinations of the menu «بیشتر» (358:483) keep its tab
    case 'more':
    case 'settings':
    case 'purchases':
    case 'catalog':
    case 'categories':
    case 'orders':
    case 'services':
    case 'shortcuts':
    case 'checks':
      return 'more';
    default:
      return 'home';
  }
};

/** Active sidebar row from the URL (product entry belongs to the catalog, and purchases keep their own destination). */
export const activeSidebarItem = (pathname: string): SellerSidebarItem => {
  const section = pathname.split('/')[3] ?? 'home';
  switch (section) {
    case 'sales':
      return 'sale';
    case 'products':
    case 'entry':
    case 'catalog':
    case 'categories':
      return 'catalog';
    case 'inventory':
      return 'inventory';
    case 'purchases':
      return 'purchases';
    case 'services':
      return 'services';
    case 'shortcuts':
      return 'shortcuts';
    case 'orders':
      return 'orders';
    case 'customers':
    case 'debts':
    case 'credit':
      return 'customers';
    case 'checks':
      return 'checks';
    case 'reports':
      return 'reports';
    case 'settings':
      if (pathname.split('/')[4] === 'staff') return 'staff';
      if (pathname.split('/')[4] === 'support') return 'support';
      return 'settings';
    case 'more':
      return 'settings';
    default:
      return 'home';
  }
};
