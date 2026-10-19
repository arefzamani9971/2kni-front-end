import { round2 } from './money';
import type { Dto } from '@dukani/contracts';
import { PERMISSIONS } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import { productTypeAttributes, unitById } from '../db/reference';
import { storeTypes } from '../db/reference.constants';
import type { CatalogItemRecord } from '../db/reference.types';
import type {
  MemberRecord,
  StoreProductRecord,
  StoreProductUnitRecord,
  StoreRecord,
  UserRecord,
} from '../db/state';
import { str, toRuleDto } from '../db/wire';

/** Record → DTO mappers shared by the handlers (one place per DTO, like backend projections). */
export const toUserDto = (u: UserRecord): Dto<'CurrentUserDto'> => ({
  id: u.id,
  mobile: u.mobile,
  displayName: u.displayName,
  defaultStoreId: u.defaultStoreId,
  platformRoles: u.platformRoles,
});

export const toStoreDto = (db: MockDb, s: StoreRecord, m: MemberRecord): Dto<'StoreDto'> => ({
  id: s.id,
  name: s.name,
  storeType: storeTypes.find((t) => t.id === s.storeTypeId) ?? storeTypes[0]!,
  businessMode: s.businessMode,
  phone: s.phone,
  email: s.email,
  address: s.address ?? null,
  openingHours: s.openingHours ?? [],
  logoFileId: s.logoFileId ?? null,
  timeZoneId: s.timeZoneId,
  myRole: m.role,
  myPermissions: m.role === 'Owner' ? [...PERMISSIONS] : db.permissionsOf(m),
  completion: {
    hasContact: !!(s.phone || s.email),
    hasAddress: !!s.address,
    hasHours: !!s.openingHours?.length,
    hasPrivateInfo: !!s.privateInfo && Object.values(s.privateInfo).some((v) => v),
  },
  version: s.version,
  logoUrl: s.logoFileId ? `mock://files/${s.logoFileId}` : null,
});

export const productTitle = (db: MockDb, p: StoreProductRecord) =>
  p.localTitle ?? db.catalogItems().find((i) => i.id === p.catalogItemId)?.title ?? '—';

export const toCatalogSummary = (
  db: MockDb,
  i: CatalogItemRecord,
  storeId: string,
): Dto<'CatalogItemSummaryDto'> => {
  const type = db.productTypes().find((t) => t.id === i.productTypeId);
  return {
    id: i.id,
    title: i.title,
    productTypeId: i.productTypeId,
    productTypeName: type?.name ?? '—',
    brandName: i.brandId ? (db.brands().find((b) => b.id === i.brandId)?.name ?? null) : null,
    brandStatus: i.brandStatus,
    baseUnitName: unitById(i.baseUnitId)?.name ?? '—',
    keyAttributes: i.keyAttributes,
    primaryImageFileId: i.imageFileIds[0] ?? null,
    status: i.status,
    origin: i.origin,
    myStoreProductId:
      db.state.storeProducts.find((p) => p.storeId === storeId && p.catalogItemId === i.id)?.id ?? null,
  };
};

export const toProductTypeSummary = (db: MockDb, id: string): Dto<'ProductTypeSummaryDto'> => {
  const t = db.productTypes().find((x) => x.id === id)!;
  return {
    id: t.id,
    name: t.name,
    categoryId: t.categoryId,
    categoryName: db.categories().find((c) => c.id === t.categoryId)?.name ?? null,
    measureDimension: t.measureDimension,
    status: t.status ?? (t.ownerStoreId ? 'Private' : 'Public'),
    itemCount: db.catalogItems().filter((i) => i.productTypeId === t.id).length,
    attributeNames: [...productTypeAttributes(t.key)].sort((a, b) => a.sort - b.sort).map((a) => a.name),
  };
};

export const toCatalogItemDto = (
  db: MockDb,
  i: CatalogItemRecord,
  storeId: string,
): Dto<'CatalogItemDto'> => {
  const brand = i.brandId ? db.brands().find((b) => b.id === i.brandId) : undefined;
  return {
    kind: i.kind ?? 'Goods',
    id: i.id,
    title: i.title,
    productType: toProductTypeSummary(db, i.productTypeId),
    brand: brand ? { id: brand.id, name: brand.name, nameEn: brand.nameEn, status: brand.status } : null,
    brandStatus: i.brandStatus,
    baseUnit: unitById(i.baseUnitId)!,
    netContentValue: str(i.netContentValue),
    netContentUnit: i.netContentUnitId ? (unitById(i.netContentUnitId) ?? null) : null,
    attributes: [],
    units: i.units.map((u) => ({ ...u, baseQty: str(u.baseQty), barcodes: u.barcodes })),
    images: i.imageFileIds.map((fileId, n) => ({
      id: fileId,
      fileId,
      isPrimary: n === 0,
      sort: n,
      origin: 'Store' as const,
    })),
    description: i.description,
    status: i.status,
    origin: i.origin,
    schemaVersion: 1,
    myStoreProductId:
      db.state.storeProducts.find((p) => p.storeId === storeId && p.catalogItemId === i.id)?.id ?? null,
  };
};

const available = (p: StoreProductRecord) => p.onHand - p.reserved;
const unitOrder = (a: StoreProductUnitRecord, b: StoreProductUnitRecord) =>
  Number(a.archivedAt !== null) - Number(b.archivedAt !== null) ||
  a.baseQty - b.baseQty ||
  a.name.localeCompare(b.name, 'fa');
export const isLowStock = (p: StoreProductRecord) =>
  p.lowStockThreshold !== null && available(p) <= p.lowStockThreshold;

export const toProductSummary = (db: MockDb, p: StoreProductRecord): Dto<'StoreProductSummaryDto'> => {
  const ci = db.catalogItems().find((i) => i.id === p.catalogItemId);
  return {
    id: p.id,
    title: productTitle(db, p),
    sku: p.sku,
    productTypeName: ci ? (db.productTypes().find((t) => t.id === ci.productTypeId)?.name ?? '—') : '—',
    brandName: ci?.brandId ? (db.brands().find((b) => b.id === ci.brandId)?.name ?? null) : null,
    baseUnitName: ci ? (unitById(ci.baseUnitId)?.name ?? '—') : '—',
    onHand: str(p.onHand),
    available: str(available(p)),
    baseSalePriceAmount: str(p.baseSalePrice),
    costStatus: p.costStatus,
    isLowStock: isLowStock(p),
    status: p.status,
    primaryImageFileId: ci?.imageFileIds[0] ?? null,
    kind: p.kind ?? 'Goods',
    shortcut: p.shortcut ?? null,
  };
};

export const toProductDto = (db: MockDb, p: StoreProductRecord): Dto<'StoreProductDto'> => {
  const ci = db.catalogItems().find((i) => i.id === p.catalogItemId)!;
  const base = unitById(ci.baseUnitId);
  return {
    id: p.id,
    catalogItemId: ci.id,
    title: productTitle(db, p),
    catalogTitle: ci.title,
    localTitle: p.localTitle,
    localNote: p.localNote,
    sku: p.sku,
    catalogStatus: ci.status,
    productTypeName: db.productTypes().find((t) => t.id === ci.productTypeId)?.name ?? '—',
    brandName: ci.brandId ? (db.brands().find((b) => b.id === ci.brandId)?.name ?? null) : null,
    baseUnitName: base?.name ?? '—',
    baseUnitMaxDecimals: base?.maxDecimals ?? 0,
    onHand: str(p.onHand),
    reserved: str(p.reserved),
    available: str(available(p)),
    averageCostAmount: str(p.averageCost),
    costStatus: p.costStatus,
    pricing: toRuleDto(p.pricing),
    baseSalePriceAmount: str(p.baseSalePrice),
    isBelowCost: p.baseSalePrice !== null && p.averageCost !== null && p.baseSalePrice < p.averageCost,
    lowStockThreshold: str(p.lowStockThreshold),
    reorderTargetQty: null,
    noReorder: false,
    allowPreOrder: false,
    preOrderLeadDays: null,
    // active units first, like the server (F12: retired units stay for history)
    units: [...p.units].sort(unitOrder).map((u) => ({
      id: u.id,
      catalogItemUnitId: u.catalogItemUnitId,
      name: u.name,
      baseQty: str(u.baseQty),
      salePriceAmount: str(u.salePrice),
      effectivePriceAmount: str(
        u.salePrice ?? (p.baseSalePrice !== null ? round2(p.baseSalePrice * u.baseQty) : null),
      ),
      isSellable: u.isSellable,
      barcodes: u.barcodes,
      isPurchasable: u.isPurchasable,
      archivedAt: u.archivedAt,
      isBase: u.isBase,
    })),
    status: p.status,
    version: p.version,
    kind: p.kind ?? 'Goods',
    shortcut: p.shortcut ?? null,
    serviceCostAmount: p.kind === 'Service' ? str(p.averageCost) : null,
  };
};

/** Cursor pagination over an in-memory list (cursor = offset). */
export const page = <T>(items: T[], query: URLSearchParams, defaultLimit = 20) => {
  const limit = Math.min(Number(query.get('limit') ?? defaultLimit) || defaultLimit, 100);
  const offset = Number(query.get('cursor') ?? 0) || 0;
  const slice = items.slice(offset, offset + limit);
  return {
    items: slice,
    nextCursor: offset + limit < items.length ? String(offset + limit) : null,
    totalCount: items.length,
  };
};
