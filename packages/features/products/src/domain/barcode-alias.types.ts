/** Feature-owned command and review models; transport DTOs stay in infrastructure. */
export type BarcodeAliasRequest = {
  readonly storeProductUnitId: string;
  readonly barcode: string;
  readonly expectedVersion: number;
};
export type BarcodeAliasConfirmation = BarcodeAliasRequest & { readonly previewToken: string };
export type BarcodeAliasPreview = BarcodeAliasConfirmation & {
  readonly storeProductId: string;
  readonly title: string;
  readonly unitName: string;
  readonly baseQty: string;
  readonly existingBarcodes: readonly string[];
  readonly alreadyExists: boolean;
  readonly expiresAt: string;
};
export type BarcodeAliasResult = {
  readonly storeProductId: string;
  readonly storeProductUnitId: string;
  readonly barcode: string;
  readonly alreadyExists: boolean;
};
