/** Filters of the store catalog list, shared by the cursor GET and the paged POST (backend `CatalogSearchQuery`). */
export type CatalogItemSearch = {
  readonly q?: string | null;
  readonly barcode?: string | null;
  readonly categoryId?: string | null;
  readonly productTypeId?: string | null;
  readonly brandId?: string | null;
  readonly onlyNotInMyStore?: boolean | null;
  readonly onlyStoreType?: boolean | null;
};
