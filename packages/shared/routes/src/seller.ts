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
    /** Services and sale shortcuts (Figma 16 sidebar «خدمات و میان‌بر»). */
    services: (id: string) => `${s(id)}/services`,
    /** Received cheques (Figma 16 sidebar «چک‌های دریافتی»). */
    checks: (id: string) => `${s(id)}/checks`,
  },
  /** settings (Figma 358:484) and its destinations; F03 store info/edit live under it. */
  settings: {
    /** STORE-04 «اطلاعات و تنظیمات» (385:6853). */
    store: (id: string) => `${s(id)}/settings/store`,
    /** STORE-05 «ویرایش فروشگاه» (385:6912). */
    storeEdit: (id: string) => `${s(id)}/settings/store/edit`,
    /** storeprofile «تماس و نشانی» (358:481) of an existing store. */
    storeContact: (id: string) => `${s(id)}/settings/store/contact`,
    /** storelegal «مالک و تسویه» (358:482) of an existing store. */
    storePrivate: (id: string) => `${s(id)}/settings/store/private`,
    staff: (id: string) => `${s(id)}/settings/staff`,
    scan: (id: string) => `${s(id)}/settings/scan`,
    orders: (id: string) => `${s(id)}/settings/orders`,
    sessions: (id: string) => `${s(id)}/settings/sessions`,
    export: (id: string) => `${s(id)}/settings/export`,
    support: (id: string) => `${s(id)}/settings/support`,
  },
  /** menu «بیشتر» (Figma 358:483) destinations that have no own module group yet. */
  more: {
    orders: (id: string) => `${s(id)}/orders`,
    shortcuts: (id: string) => `${s(id)}/shortcuts`,
    catalog: (id: string) => `${s(id)}/catalog`,
    catalogNew: (id: string) => `${s(id)}/catalog/new`,
    categories: (id: string) => `${s(id)}/categories`,
    debtors: (id: string) => `${s(id)}/debts`,
    credit: (id: string) => `${s(id)}/credit`,
    actions: (id: string) => `${s(id)}/actions`,
  },
  catalog: {
    list: (id: string, productTypeId?: string, query?: string) =>
      `${s(id)}/catalog${q({ productTypeId, q: query })}`,
    categories: (id: string, query?: string) => `${s(id)}/categories${q({ q: query })}`,
    type: (id: string, typeId: string) => `${s(id)}/categories/types/${encodeURIComponent(typeId)}`,
    newType: (id: string) => `${s(id)}/categories/new`,
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
    draft: (
      id: string,
      draftId: string,
      step: 'details' | 'units' | 'stock' | 'pricing' | 'review' | 'done',
    ) => `${s(id)}/entry/${draftId}/${step}`,
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
