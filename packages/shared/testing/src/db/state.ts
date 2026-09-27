import type { Dto } from '@dukani/contracts';
import type { BrandRecord, CatalogItemRecord, ProductTypeRecord } from './reference';

export type UserRecord = {
  id: string;
  mobile: string;
  displayName: string | null;
  defaultStoreId: string | null;
  platformRoles: string[];
};

export type OtpRecord = { requestId: string; mobile: string; code: string; expiresAt: number; resendAt: number; attempts: number; used: boolean };
export type SessionRecord = { refreshToken: string; userId: string; expiresAt: number };

export type StoreRecord = {
  id: string;
  name: string;
  storeTypeId: string;
  businessMode: Dto<'BusinessMode'> | null;
  phone: string | null;
  email: string | null;
  timeZoneId: string;
  createdAt: string;
};

export type MemberRecord = { storeId: string; userId: string; role: Dto<'MemberRole'>; permissions: string[] };

export type StoreProductUnitRecord = {
  id: string;
  catalogItemUnitId: string | null;
  name: string;
  baseQty: number;
  salePrice: number | null;
  isSellable: boolean;
  barcodes: string[];
};

export type StoreProductRecord = {
  id: string;
  storeId: string;
  catalogItemId: string;
  localTitle: string | null;
  localNote: string | null;
  sku: string;
  onHand: number;
  reserved: number;
  averageCost: number | null;
  costStatus: Dto<'CostStatus'>;
  pricing: Dto<'PriceRuleDto'>;
  baseSalePrice: number | null;
  lowStockThreshold: number | null;
  units: StoreProductUnitRecord[];
  status: Dto<'StoreProductStatus'>;
  version: number;
  createdAt: string;
};

export type SupplierRecord = { id: string; storeId: string; name: string; phone: string | null; note: string | null; isArchived: boolean };

export type PurchaseLineRecord = {
  id: string;
  storeProductId: string;
  storeProductUnitId: string;
  quantity: number;
  unitCost: number | null;
  costStatus: Dto<'CostStatus'>;
  productionDate: string | null;
  expiryDate: string | null;
  manufacturerPrice: number | null;
  printedPrice: number | null;
};

export type PurchaseRecord = {
  id: string;
  storeId: string;
  number: number | null;
  kind: Dto<'PurchaseKind'>;
  status: Dto<'PurchaseStatus'>;
  supplierId: string | null;
  supplierInvoiceNo: string | null;
  purchasedAt: string;
  discount: number;
  shipping: number;
  nonRecoverableTax: number;
  note: string | null;
  lines: PurchaseLineRecord[];
  attachmentFileIds: string[];
  finalizedAt: string | null;
  version: number;
  createdAt: string;
};

export type FileRecord = { id: string; storeId: string; name: string; contentType: string; size: number; createdAt: string };

/** Everything the mock backend persists (reference data from the seed is rebuilt, not stored). */
export type MockState = {
  schema: 1;
  users: UserRecord[];
  otps: OtpRecord[];
  sessions: SessionRecord[];
  stores: StoreRecord[];
  members: MemberRecord[];
  productTypes: ProductTypeRecord[];
  brands: BrandRecord[];
  catalogItems: CatalogItemRecord[];
  storeProducts: StoreProductRecord[];
  suppliers: SupplierRecord[];
  purchases: PurchaseRecord[];
  operations: Dto<'OperationStatusDto'>[];
  files: FileRecord[];
  sequences: Record<string, number>;
};
