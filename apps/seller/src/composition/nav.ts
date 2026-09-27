import { sellerRoutes } from '@dukani/routes';
import type { NavItem } from '@dukani/ui-kit';

export type SellerTab = 'home' | 'products' | 'customers' | 'reports' | 'more';

/** Bottom navigation of Figma page 17: خانه، کالاها، مشتریان، گزارش‌ها، بیشتر. */
export const sellerNav = (storeId: string): NavItem[] => [
  { id: 'home', label: 'خانه', icon: 'home', href: sellerRoutes.store.home(storeId) },
  { id: 'products', label: 'کالاها', icon: 'products', href: sellerRoutes.products.list(storeId) },
  { id: 'customers', label: 'مشتریان', icon: 'customers', href: sellerRoutes.store.customers(storeId) },
  { id: 'reports', label: 'گزارش‌ها', icon: 'reports', href: sellerRoutes.store.reports(storeId) },
  { id: 'more', label: 'بیشتر', icon: 'more', href: sellerRoutes.store.more(storeId) },
];

/** Active tab from the URL: flows keep the tab they belong to (entry → home, like Figma). */
export const activeTab = (pathname: string): SellerTab => {
  const section = pathname.split('/')[3] ?? 'home';
  if (section === 'products' || section === 'inventory') return 'products';
  if (section === 'customers' || section === 'debts') return 'customers';
  if (section === 'reports') return 'reports';
  if (section === 'more' || section === 'settings' || section === 'purchases') return 'more';
  return 'home';
};
