/** Typed cross-feature events (features never import each other). Future events are reserved, not emitted. */
export type AppEventMap = {
  'auth.signedIn': { userId: string };
  'auth.signedOut': Record<string, never>;
  'store.created': { storeId: string };
  'store.switched': { storeId: string };
  'product.created': { storeId: string; storeProductId: string; kind: 'Goods' | 'Service' };
  'purchase.finalized': { storeId: string; purchaseId: string };
  'sale.committed': { storeId: string; invoiceId: string };
  'customer.created': { storeId: string; customerId: string };
  // Reserved (1.2 / 3.0):
  'settlement.requested': { storeId: string; requestId: string };
  'order.reserved': { storeId: string; orderId: string };
};

export type AppEventName = keyof AppEventMap;
