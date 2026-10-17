export type CatalogStatus = 'Private' | 'PendingReview' | 'Public' | 'Archived';
export type Dimension = 'Count' | 'Mass' | 'Volume' | 'Length';
export type CatalogUnit = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly symbol: string;
  readonly dimension: Dimension;
  readonly factorToBase: string;
  readonly maxDecimals: number;
};
export type CatalogCategory = {
  readonly id: string;
  readonly name: string;
  readonly parentId: string | null;
  readonly sort: number;
  readonly status: CatalogStatus;
  readonly productTypeCount: number;
  readonly productCount: number;
  readonly children: readonly CatalogCategory[];
};
export type CatalogTypeSummary = {
  readonly id: string;
  readonly name: string;
  readonly categoryId: string | null;
  readonly categoryName: string | null;
  readonly measureDimension: Dimension;
  readonly status: CatalogStatus;
  readonly itemCount: number;
  /** Current schema attribute names in schema order (list cards describe a type without loading its detail). */
  readonly attributeNames: readonly string[];
};
export type CatalogAttribute = {
  readonly attributeId: string;
  readonly key: string;
  readonly name: string;
  readonly dataType: 'Text' | 'Number' | 'Bool' | 'Option' | 'MultiOption';
  readonly isRequired: boolean;
  readonly isVariantAxis: boolean;
  readonly sort: number;
  readonly options: readonly {
    readonly id: string;
    readonly key: string;
    readonly value: string;
    readonly colorHex: string | null;
    readonly isArchived: boolean;
  }[];
};
export type CatalogType = Omit<CatalogTypeSummary, 'itemCount' | 'attributeNames'> & {
  readonly defaultBaseUnit: CatalogUnit;
  readonly allowedUnits: readonly CatalogUnit[];
  readonly allowDecimalQuantity: boolean;
  readonly defaultPackagings: readonly { readonly name: string; readonly baseQty: string }[];
  readonly schemaVersion: number;
  readonly attributes: readonly CatalogAttribute[];
};
export type CatalogBrand = {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string | null;
  readonly status: CatalogStatus;
};
export type CatalogItemSummary = {
  readonly id: string;
  readonly title: string;
  readonly productTypeId: string;
  readonly productTypeName: string;
  readonly brandName: string | null;
  readonly baseUnitName: string;
  readonly keyAttributes: string | null;
  readonly status: CatalogStatus;
  readonly myStoreProductId: string | null;
};
/** Applied filter of the catalog list (F07 CAT-13): text or barcode, and the product type chip. */
export type CatalogItemFilter = {
  readonly q: string;
  readonly productTypeId: string | null;
};
/** Sortable columns of `POST …/catalog/items/search`. */
export type CatalogItemSort = 'title';
export type NewCatalogType = {
  readonly name: string;
  readonly categoryId: string | null;
  readonly defaultBaseUnitId: string;
  readonly defaultPackagings: readonly { readonly name: string; readonly baseQty: string }[];
};
