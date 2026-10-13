import type { Dto } from '@dukani/contracts';
import type { MockPriceRule } from './wire.types';
import type { BrandRecord, CatalogItemRecord, CategoryRecord, ProductTypeRecord } from './reference.types';

export type UserRecord = {
  id: string;
  mobile: string;
  displayName: string | null;
  defaultStoreId: string | null;
  platformRoles: string[];
};

export type OtpRecord = {
  requestId: string;
  mobile: string;
  code: string;
  expiresAt: number;
  resendAt: number;
  attempts: number;
  used: boolean;
};
export type SessionRecord = { refreshToken: string; userId: string; expiresAt: number };

export type StoreRecord = {
  joinCode?: string;
  id: string;
  name: string;
  storeTypeId: string;
  businessMode: Dto<'BusinessMode'> | null;
  phone: string | null;
  email: string | null;
  timeZoneId: string;
  createdAt: string;
  /** Row version (backend xmin): bumped by every profile/logo change; a stale `expectedVersion` → 409 (F03). */
  version: number;
  /** Optional profile (F02/F03); absent = never filled. */
  address?: Dto<'AddressDto'> | null;
  openingHours?: Dto<'OpeningHoursDto'>[];
  logoFileId?: string | null;
  privateInfo?: Dto<'StorePrivateInfoDto'> | null;
};

export type MemberRecord = {
  storeId: string;
  userId: string;
  role: Dto<'MemberRole'>;
  permissions: string[];
};

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
  pricing: MockPriceRule;
  /** Goods or service (BCR-02); absent = goods. */
  kind?: Dto<'ItemKind'>;
  /** Cart shortcut such as "P1" (BCR-03). */
  shortcut?: string | null;
  showInQuickPick?: boolean;
  quickPickSortOrder?: number | null;
  serviceCostAmount?: number | null;
  baseSalePrice: number | null;
  lowStockThreshold: number | null;
  units: StoreProductUnitRecord[];
  status: Dto<'StoreProductStatus'>;
  version: number;
  createdAt: string;
};

export type SupplierRecord = {
  id: string;
  storeId: string;
  name: string;
  phone: string | null;
  note: string | null;
  isArchived: boolean;
};

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

export type FileRecord = {
  id: string;
  storeId: string;
  name: string;
  contentType: string;
  size: number;
  createdAt: string;
};

/** Everything the mock backend persists (reference data from the seed is rebuilt, not stored). */
export type MockState = {
  schema: 1;
  users: UserRecord[];
  otps: OtpRecord[];
  sessions: SessionRecord[];
  stores: StoreRecord[];
  members: MemberRecord[];
  categories?: CategoryRecord[];
  productTypes: ProductTypeRecord[];
  brands: BrandRecord[];
  catalogItems: CatalogItemRecord[];
  corrections?: (Dto<'CorrectionRequestDto'> & { storeId: string })[];
  storeProducts: StoreProductRecord[];
  suppliers: SupplierRecord[];
  purchases: PurchaseRecord[];
  operations: Dto<'OperationStatusDto'>[];
  files: FileRecord[];
  sequences: Record<string, number>;
};
