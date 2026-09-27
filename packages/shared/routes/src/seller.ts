/**
 * URL contract of the seller app (architecture §8). Features link to each other only through these
 * builders; the app's `src/app` folders mirror them.
 */
const s = (storeId: string) => `/s/${encodeURIComponent(storeId)}`;
const q = (params: Record<string, string | undefined>) => {
  const e = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  return e.length ? `?${new URLSearchParams(e as [string, string][]).toString()}` : '';
};

export const sellerRoutes = {
  root: () => '/',
  login: (next?: string) => `/login${q({ next })}`,
  otp: (next?: string) => `/login/otp${q({ next })}`,
  stores: () => '/stores',
  newStore: () => '/stores/new',
  store: {
    home: (id: string) => `${s(id)}/home`,
    more: (id: string) => `${s(id)}/more`,
    onboarding: (id: string) => `${s(id)}/onboarding`,
    customers: (id: string) => `${s(id)}/customers`,
    reports: (id: string) => `${s(id)}/reports`,
    settings: (id: string) => `${s(id)}/settings`,
  },
  products: {
    list: (id: string) => `${s(id)}/products`,
    detail: (id: string, productId: string) => `${s(id)}/products/${productId}`,
  },
  entry: {
    method: (id: string) => `${s(id)}/entry`,
    search: (id: string, query?: string) => `${s(id)}/entry/search${q({ q: query })}`,
    barcode: (id: string) => `${s(id)}/entry/barcode`,
    scan: (id: string) => `${s(id)}/entry/scan`,
    service: (id: string) => `${s(id)}/entry/service`,
    draft: (id: string, draftId: string, step: 'details' | 'units' | 'stock' | 'pricing' | 'review' | 'done') =>
      `${s(id)}/entry/${draftId}/${step}`,
  },
  /** A new receipt is a server draft at once (`POST …/purchases`), so its steps carry the draft id (refresh-safe). */
  purchases: {
    list: (id: string) => `${s(id)}/purchases`,
    new: (id: string) => `${s(id)}/purchases/new`,
    lines: (id: string, purchaseId: string) => `${s(id)}/purchases/${purchaseId}/lines`,
    totals: (id: string, purchaseId: string) => `${s(id)}/purchases/${purchaseId}/totals`,
    attachment: (id: string, purchaseId: string) => `${s(id)}/purchases/${purchaseId}/attachment`,
    detail: (id: string, purchaseId: string) => `${s(id)}/purchases/${purchaseId}`,
  },
  inventory: { list: (id: string) => `${s(id)}/inventory` },
  sales: { new: (id: string) => `${s(id)}/sales/new` },
} as const;

export type SellerRoutes = typeof sellerRoutes;
