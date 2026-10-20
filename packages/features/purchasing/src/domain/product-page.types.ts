import type { DecimalString, Money } from '@dukani/domain';

/** A store product as the opening pick and the purchase autocomplete list it (`POST …/products/search`). */
export type ProductPageRow = {
  readonly id: string;
  readonly title: string;
  readonly sku: string;
  /** The base unit's code; null when the product has none. */
  readonly barcode: string | null;
  readonly baseUnitName: string;
  readonly onHand: DecimalString;
  readonly salePrice: Money | null;
  /** Any stock movement exists: an Opening is no longer allowed (CPB-D04). */
  readonly hasStockHistory: boolean;
};

export type ProductPageFilter = {
  readonly q?: string;
  /** Only products an Opening may still be recorded for. */
  readonly withoutStockHistory?: boolean;
};

export type ProductPageSort = 'title' | 'onHand';

/** What a scanned or typed barcode names in this store (identification only, CPB-18). */
export type BarcodeIdentification =
  | {
      readonly kind: 'product';
      readonly productId: string;
      readonly unitId: string | null;
      readonly title: string;
    }
  /** Known code, but no active goods product of this store (absent, catalog-only, archived or a service). */
  | { readonly kind: 'not-in-store' }
  /** More than one store product shares the code: the seller chooses by search. */
  | { readonly kind: 'ambiguous' };
