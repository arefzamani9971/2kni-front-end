import type { Dto } from '@dukani/contracts';
import type { DecimalString, Money } from '@dukani/domain';

/**
 * Product entry wizard (F08–F16) kept as a local draft until «تأیید و ثبت». All numbers are canonical
 * decimal strings (never floats); money is converted to the API only in `toRegisterRequest`.
 */
export type EntrySource = 'catalog' | 'new';

export type EntryUnit = {
  readonly key: string;
  readonly name: string;
  readonly baseQty: DecimalString;
  readonly catalogItemUnitId?: string;
  readonly storeProductUnitId?: string;
  /** F12: purchase and sale uses are separate; absent on older drafts (they held purchase units only). */
  readonly isPurchasable?: boolean;
  readonly isSellable?: boolean;
};

/** F12 §10: an explicit sale price of a package, kept only while the same package (key, name, size) still exists. */
export type UnitPrice = {
  readonly unitKey: string;
  readonly name: string;
  readonly baseQty: DecimalString;
  readonly price: Money;
};

export type CatalogChoice = {
  readonly kind?: 'Goods' | 'Service';
  readonly status?: Dto<'CatalogStatus'>;
  readonly id: string;
  readonly title: string;
  readonly typeName: string;
  readonly brandName: string | null;
  readonly baseUnitName: string;
  readonly baseUnitMaxDecimals: number;
  readonly units: readonly EntryUnit[];
  /** Already in this store: registering adds stock to it (backend keeps its price). */
  readonly storeProductId: string | null;
  readonly storeProductVersion?: number;
};

export type AttributeValue = {
  readonly attributeId: string;
  readonly optionIds?: readonly string[];
  readonly text?: string;
  readonly number?: DecimalString;
  readonly bool?: boolean;
};

export type Packaging = {
  readonly name: string;
  readonly baseQty: DecimalString;
  readonly barcode?: string;
  readonly isSellable?: boolean;
  readonly isPurchasable?: boolean;
};

export type EntryTypePreset = {
  readonly id: string;
  readonly name: string;
  readonly baseUnit: { readonly id: string; readonly name: string; readonly maxDecimals: number };
};

export type NewItem = {
  readonly unitsEditor?: readonly {
    readonly name: string;
    readonly baseQty: string;
    readonly barcode?: string;
    readonly isSellable?: boolean;
    readonly isPurchasable?: boolean;
  }[];
  readonly images?: readonly {
    readonly id: string;
    readonly file: File;
    readonly fileId?: string;
    readonly primary?: boolean;
  }[];
  readonly kind?: 'Goods' | 'Service';
  readonly description?: string;
  readonly netContentValue?: DecimalString | null;
  readonly netContentUnitId?: string | null;
  readonly submitForPublicReview?: boolean;
  readonly imageFileIds?: readonly string[];
  readonly title: string;
  readonly productTypeId: string;
  readonly productTypeName: string;
  readonly brandStatus: Dto<'BrandStatus'>;
  readonly brandId: string | null;
  readonly brandName: string | null;
  readonly baseUnitId: string;
  readonly baseUnitName: string;
  readonly baseUnitMaxDecimals: number;
  readonly baseBarcode: string;
  readonly attributes: readonly AttributeValue[];
  readonly packagings: readonly Packaging[];
};

export type CostStatus = Dto<'CostStatus'>;

export type StockEntry = {
  readonly manufacturerPrice?: Money | null;
  readonly printedPrice?: Money | null;
  readonly kind: Dto<'PurchaseKind'>;
  /** `base` or `pack:<index>` (new item) / `unit:<catalogItemUnitId>` (catalog item). */
  readonly unitKey: string;
  readonly quantity: DecimalString;
  readonly costStatus: CostStatus;
  readonly unitCost: Money | null;
  readonly supplierId: string | null;
  readonly supplierName: string | null;
  readonly supplierInvoiceNo: string;
  readonly productionDate: string | null;
  readonly expiryDate: string | null;
};

export type PriceMethod = Dto<'PriceMethod'>;

export type Pricing = {
  readonly roundingDirection?: Dto<'RoundingDirection'>;
  readonly method: PriceMethod;
  readonly manualPrice: Money | null;
  readonly markupPercent: DecimalString | null;
  readonly fixedProfit: Money | null;
  readonly roundingStep: Money | null;
};

export type EntryResult = Dto<'RegisterProductResultDto'> & {
  readonly title: string;
  readonly baseUnitName: string;
};

export type DetailsEditorDraft = {
  readonly scene?: 'main' | 'attributes' | 'images';
  readonly schemaVersion: number | null;
  readonly fields: {
    readonly title: string;
    readonly productTypeId: string;
    readonly brand: string;
    readonly baseUnitId: string;
    readonly barcode: string;
    readonly description?: string;
    readonly localTitle?: string;
    readonly localNote?: string;
    readonly shortcut?: string;
    readonly serviceCost?: string;
    readonly netContentValue?: string;
    readonly netContentUnitId?: string;
  };
  readonly attributes: Readonly<Record<string, string | readonly string[]>>;
  readonly expanded: boolean;
  readonly creation?: { readonly kind: 'brand' | 'type'; readonly name: string } | null;
};

export type EntryDraft = {
  /** CPB-01: identity is committed separately from any later stock receipt. Absent on legacy drafts. */
  readonly intent?: 'standalone' | 'compound';
  readonly purchaseHostId?: string;
  readonly stockEditor?: {
    readonly kind: Dto<'PurchaseKind'>;
    readonly fields: {
      readonly quantity: string;
      readonly unitKey: string;
      readonly costStatus: CostStatus;
      readonly unitCost: string;
      readonly supplierId: string;
      readonly invoiceNo: string;
      readonly productionDate: string;
      readonly expiryDate: string;
      readonly manufacturerPrice: string;
      readonly printedPrice: string;
    };
  };
  readonly pricingEditor?: {
    readonly method: PriceMethod;
    readonly manualPrice: string;
    readonly markupPercent: string;
    readonly fixedProfit: string;
    readonly roundingStep: string;
    readonly roundingDirection: Dto<'RoundingDirection'>;
    readonly lowStock: string;
    readonly packPrices?: readonly { readonly unitKey: string; readonly price: string }[];
  };
  readonly shortcut?: string;
  readonly serviceCost?: Money | null;
  readonly pending?: { readonly operationId: string; readonly body: Dto<'RegisterProductRequest'> };
  readonly bulkHost?: boolean;
  /** Raw editor data includes invalid and unfinished inputs; only validated values become a command. */
  readonly detailsEditor?: DetailsEditorDraft;
  readonly id: string;
  readonly source: EntrySource;
  readonly catalog: CatalogChoice | null;
  readonly localTitle: string;
  readonly localNote?: string;
  readonly scanContext?: Dto<'BarcodeMatchDto'>;
  readonly newItem: NewItem | null;
  /** null = no stock now (stock is optional in the backend). */
  readonly stock: StockEntry | null;
  readonly stockDecided: boolean;
  readonly pricing: Pricing | null;
  /** Explicit package prices of a product new to the store (F12 §10); other packages follow the base price. */
  readonly unitPrices?: readonly UnitPrice[];
  readonly lowStockThreshold: DecimalString | null;
  /** One id for the whole «تأیید و ثبت» action; retries reuse it (P11). */
  readonly operationId: string | null;
  readonly result: EntryResult | null;
};

export type EntryStep = 'details' | 'units' | 'stock' | 'pricing' | 'review' | 'done';
