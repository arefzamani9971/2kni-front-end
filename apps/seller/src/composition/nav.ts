import { sellerRoutes } from '@dukani/routes';
import type { NavItem } from '@dukani/ui-kit';
import type { SellerSidebarItem, SellerTab } from './nav.types';

/** Bottom navigation of Figma page 17: خانه، کالاها، مشتریان، گزارش‌ها، بیشتر. */
export const sellerNav = (storeId: string): NavItem[] => [
  { id: 'home', label: 'خانه', icon: 'home', href: sellerRoutes.store.home(storeId) },
  { id: 'products', label: 'کالاها', icon: 'products', href: sellerRoutes.products.list(storeId) },
  { id: 'customers', label: 'مشتریان', icon: 'customers', href: sellerRoutes.store.customers(storeId) },
  { id: 'reports', label: 'گزارش‌ها', icon: 'reports', href: sellerRoutes.store.reports(storeId) },
  { id: 'more', label: 'بیشتر', icon: 'more', href: sellerRoutes.store.more(storeId) },
];

/** Desktop sidebar of Figma page 16 (498:563): nine text rows; the sidebar has room the tab bar has not. */
export const sellerSidebar = (storeId: string): NavItem[] => [
  { id: 'home', label: 'خانه', icon: 'home', href: sellerRoutes.store.home(storeId) },
  { id: 'sale', label: 'فروش کالا و خدمت', icon: 'cart', href: sellerRoutes.sales.new(storeId) },
  { id: 'products', label: 'کالاهای فروشگاه', icon: 'products', href: sellerRoutes.products.list(storeId) },
  { id: 'inventory', label: 'موجودی', icon: 'list', href: sellerRoutes.inventory.list(storeId) },
  { id: 'services', label: 'خدمات و میان‌بر', icon: 'print', href: sellerRoutes.store.services(storeId) },
  { id: 'customers', label: 'مشتریان', icon: 'customers', href: sellerRoutes.store.customers(storeId) },
  { id: 'checks', label: 'چک‌های دریافتی', icon: 'receipt', href: sellerRoutes.store.checks(storeId) },
  { id: 'reports', label: 'گزارش‌ها', icon: 'reports', href: sellerRoutes.store.reports(storeId) },
  { id: 'settings', label: 'تنظیمات', icon: 'settings', href: sellerRoutes.store.settings(storeId) },
];

/**
 * Before a store exists (storeselect, setup — Figma 358:5343, 312:201) the same rows are shown but disabled:
 * every destination needs a store id, and none is active.
 */
export const preStoreSidebar = (): NavItem[] =>
  sellerSidebar('_').map((item) => ({ ...item, href: '#', disabled: true }));

/** Active tab from the URL: flows keep the tab they belong to (entry → home, like Figma). */
export const activeTab = (pathname: string): SellerTab => {
  const section = pathname.split('/')[3] ?? 'home';
  if (section === 'products' || section === 'inventory') return 'products';
  if (section === 'customers' || section === 'debts') return 'customers';
  if (section === 'reports') return 'reports';
  if (section === 'more' || section === 'settings' || section === 'purchases') return 'more';
  return 'home';
};

/** Active sidebar row from the URL (product entry belongs to «کالاهای فروشگاه», purchases to «موجودی»). */
export const activeSidebarItem = (pathname: string): SellerSidebarItem => {
  const section = pathname.split('/')[3] ?? 'home';
  switch (section) {
    case 'sales':
      return 'sale';
    case 'products':
    case 'entry':
      return 'products';
    case 'inventory':
    case 'purchases':
      return 'inventory';
    case 'services':
      return 'services';
    case 'customers':
    case 'debts':
      return 'customers';
    case 'checks':
      return 'checks';
    case 'reports':
      return 'reports';
    case 'settings':
    case 'more':
      return 'settings';
    default:
      return 'home';
  }
};
