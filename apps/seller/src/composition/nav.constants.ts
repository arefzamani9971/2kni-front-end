/** Sidebar message keys belong to the app catalog. */
export const SIDEBAR_WORKSPACE = 'sellerWorkspace';
export const SIDEBAR_FOOTER = 'workspace';

import { sellerRoutes } from '@dukani/routes';
/** Figma seller desktop 358:5348/5354: the shared 14-row navigation, in design order. */
export const SELLER_SIDEBAR = [
  { id: 'home', label: 'home', icon: 'home', href: sellerRoutes.store.home },
  { id: 'catalog', label: 'catalogNavigation', icon: 'products', href: sellerRoutes.catalog.list },
  { id: 'inventory', label: 'inventory', icon: 'list', href: sellerRoutes.inventory.list },
  { id: 'purchases', label: 'sidebarPurchase', icon: 'receipt', href: sellerRoutes.purchases.list },
  { id: 'sale', label: 'sidebarSale', icon: 'cart', href: sellerRoutes.sales.new },
  { id: 'customers', label: 'customersDebts', icon: 'customers', href: sellerRoutes.store.customers },
  { id: 'checks', label: 'sidebarChecks', icon: 'receipt', href: sellerRoutes.store.checks },
  { id: 'orders', label: 'orders', icon: 'list', href: sellerRoutes.more.orders },
  { id: 'reports', label: 'reports', icon: 'reports', href: sellerRoutes.store.reports },
  { id: 'services', label: 'servicesRates', icon: 'print', href: sellerRoutes.store.services },
  { id: 'shortcuts', label: 'salesShortcuts', icon: 'cart', href: sellerRoutes.more.shortcuts },
  { id: 'staff', label: 'sidebarStaff', icon: 'customers', href: sellerRoutes.settings.staff },
  { id: 'settings', label: 'settings', icon: 'settings', href: sellerRoutes.store.settings },
  { id: 'support', label: 'sidebarSupport', icon: 'help', href: sellerRoutes.settings.support },
] as const;
