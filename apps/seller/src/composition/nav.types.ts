export type SellerTab = 'home' | 'products' | 'customers' | 'reports' | 'more';

/** Sidebar identity is derived from the shared navigation definition. */
import type { SELLER_SIDEBAR } from './nav.constants';
export type SellerSidebarItem = (typeof SELLER_SIDEBAR)[number]['id'];
