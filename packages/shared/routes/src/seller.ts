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
    storeQr: (id: string) => `${s(id)}/settings/store/qr`,
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
    /** CAT-CORRECTION «درخواست اصلاح کاتالوگ» (312:9108 / 312:763): propose a fix of a public catalog item (F11); productId shows that product behind the desktop dialog. */
    correction: (id: string, catalogItemId: string, productId?: string) =>
      `${s(id)}/catalog/${encodeURIComponent(catalogItemId)}/correction${q({ productId })}`,
    /** Status and timeline of one correction request (F11 §7). */
    correctionDetail: (id: string, correctionId: string) =>
      `${s(id)}/catalog/corrections/${encodeURIComponent(correctionId)}`,
  },
  products: {
    barcodeAlias: (id: string, productId: string) => `${s(id)}/products/${productId}/barcode-alias`,
    list: (id: string) => `${s(id)}/products`,
    detail: (id: string, productId: string) => `${s(id)}/products/${productId}`,
    /** PRD-LOCAL-EDIT «نام و یادداشت فروشگاه» (312:9574, F11). */
    local: (id: string, productId: string) => `${s(id)}/products/${productId}/local`,
  },
  entry: {
    catalog: (id: string) => `${s(id)}/entry/catalog`,
    new: (id: string, purchaseId?: string) => `${s(id)}/entry/new${q({ purchaseId })}`,
    method: (id: string) => `${s(id)}/entry`,
    search: (
      id: string,
      query?: string,
      bulk = false,
      filters?: { categoryId?: string; productTypeId?: string; brandId?: string },
    ) => `${s(id)}/entry/search${q({ q: query, bulk: bulk ? '1' : undefined, ...filters })}`,
    bulk: (id: string, stage?: 'review' | 'done') => `${s(id)}/entry/bulk${stage ? '/' + stage : ''}`,
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
    lines: (id: string, purchaseId: string, productId?: string) =>
      `${s(id)}/purchases/${purchaseId}/lines${q({ productId })}`,
    totals: (id: string, purchaseId: string) => `${s(id)}/purchases/${purchaseId}/totals`,
    attachment: (id: string, purchaseId: string) => `${s(id)}/purchases/${purchaseId}/attachment`,
    detail: (id: string, purchaseId: string) => `${s(id)}/purchases/${purchaseId}`,
  },
  inventory: {
    list: (id: string) => `${s(id)}/inventory`,
    import: (id: string) => `${s(id)}/inventory/import`,
  },
  sales: { new: (id: string) => `${s(id)}/sales/new` },
} as const;
