const q = (params: Record<string, string | undefined>) => {
  const e = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  return e.length ? `?${new URLSearchParams(e as [string, string][]).toString()}` : '';
};

/** URL contract of the customer app (architecture §8). */
export const customerRoutes = {
  home: () => '/',
  login: (next?: string) => `/login${q({ next })}`,
  otp: (next?: string) => `/login/otp${q({ next })}`,
  purchases: () => '/purchases',
  invoice: (invoiceId: string) => `/purchases/${invoiceId}`,
  debts: () => '/debts',
  account: () => '/account',
  storeAccount: (storeId: string) => `/stores/${storeId}`,
  settle: (storeId: string) => `/stores/${storeId}/settle`,
  settlement: (requestId: string) => `/settlements/${requestId}`,
  newClaim: (params?: { storeId?: string; invoiceId?: string }) => `/claims/new${q({ storeId: params?.storeId, invoiceId: params?.invoiceId })}`,
  claimDone: () => '/claims/done',
  profile: () => '/account/profile',
  sessions: () => '/account/sessions',
} as const;
