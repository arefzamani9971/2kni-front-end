import type { Dto } from '@dukani/contracts';
import { PERMISSIONS } from '@dukani/domain';
import type { MockDb } from '../db/mock-db';
import { categoryById, storeTypes, unitById, type CatalogItemRecord } from '../db/reference';
import type { MemberRecord, PurchaseRecord, StoreProductRecord, StoreRecord, UserRecord } from '../db/state';

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
  address: null,
  openingHours: [],
  logoFileId: null,
  timeZoneId: s.timeZoneId,
  myRole: m.role,
  myPermissions: m.role === 'Owner' ? [...PERMISSIONS] : db.permissionsOf(m),
  completion: { hasContact: !!s.phone, hasAddress: false, hasHours: false, hasPrivateInfo: false },
  logoUrl: null,
});

export const productTitle = (db: MockDb, p: StoreProductRecord) =>
  p.localTitle ?? db.catalogItems().find((i) => i.id === p.catalogItemId)?.title ?? '—';

export const toCatalogSummary = (db: MockDb, i: CatalogItemRecord, storeId: string): Dto<'CatalogItemSummaryDto'> => {
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
    myStoreProductId: db.state.storeProducts.find((p) => p.storeId === storeId && p.catalogItemId === i.id)?.id ?? null,
  };
};

export const toProductTypeSummary = (db: MockDb, id: string): Dto<'ProductTypeSummaryDto'> => {
  const t = db.productTypes().find((x) => x.id === id)!;
  return {
    id: t.id,
    name: t.name,
    categoryId: t.categoryId,
    categoryName: categoryById(t.categoryId)?.name ?? '—',
    measureDimension: t.measureDimension,
    status: t.ownerStoreId ? 'Private' : 'Public',
    itemCount: db.catalogItems().filter((i) => i.productTypeId === t.id).length,
  };
};

export const toCatalogItemDto = (db: MockDb, i: CatalogItemRecord, storeId: string): Dto<'CatalogItemDto'> => {
  const brand = i.brandId ? db.brands().find((b) => b.id === i.brandId) : undefined;
  return {
    id: i.id,
    title: i.title,
    productType: toProductTypeSummary(db, i.productTypeId),
    brand: brand ? { id: brand.id, name: brand.name, nameEn: brand.nameEn, status: brand.status } : null,
    brandStatus: i.brandStatus,
    baseUnit: unitById(i.baseUnitId)!,
    netContentValue: i.netContentValue,
    netContentUnit: i.netContentUnitId ? (unitById(i.netContentUnitId) ?? null) : null,
    attributes: [],
    units: i.units.map((u) => ({ ...u, barcodes: u.barcodes })),
    images: i.imageFileIds.map((fileId, n) => ({ id: fileId, fileId, isPrimary: n === 0, sort: n, origin: 'Store' as const })),
    description: i.description,
    status: i.status,
    origin: i.origin,
    schemaVersion: 1,
    myStoreProductId: db.state.storeProducts.find((p) => p.storeId === storeId && p.catalogItemId === i.id)?.id ?? null,
  };
};

const available = (p: StoreProductRecord) => p.onHand - p.reserved;
export const isLowStock = (p: StoreProductRecord) => p.lowStockThreshold !== null && available(p) <= p.lowStockThreshold;

export const toProductSummary = (db: MockDb, p: StoreProductRecord): Dto<'StoreProductSummaryDto'> => {
  const ci = db.catalogItems().find((i) => i.id === p.catalogItemId);
  return {
    id: p.id,
    title: productTitle(db, p),
    sku: p.sku,
    productTypeName: ci ? (db.productTypes().find((t) => t.id === ci.productTypeId)?.name ?? '—') : '—',
    brandName: ci?.brandId ? (db.brands().find((b) => b.id === ci.brandId)?.name ?? null) : null,
    baseUnitName: ci ? (unitById(ci.baseUnitId)?.name ?? '—') : '—',
    onHand: p.onHand,
    available: available(p),
    baseSalePriceRials: p.baseSalePrice,
    costStatus: p.costStatus,
    isLowStock: isLowStock(p),
    status: p.status,
    primaryImageFileId: ci?.imageFileIds[0] ?? null,
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
    onHand: p.onHand,
    reserved: p.reserved,
    available: available(p),
    averageCostRials: p.averageCost,
    costStatus: p.costStatus,
    pricing: p.pricing,
    baseSalePriceRials: p.baseSalePrice,
    isBelowCost: p.baseSalePrice !== null && p.averageCost !== null && p.baseSalePrice < p.averageCost,
    lowStockThreshold: p.lowStockThreshold,
    reorderTargetQty: null,
    noReorder: false,
    units: p.units.map((u) => ({
      id: u.id,
      catalogItemUnitId: u.catalogItemUnitId,
      name: u.name,
      baseQty: u.baseQty,
      salePriceRials: u.salePrice,
      effectivePriceRials: u.salePrice ?? (p.baseSalePrice !== null ? Math.round(p.baseSalePrice * u.baseQty) : null),
      isSellable: u.isSellable,
      barcodes: u.barcodes,
    })),
    status: p.status,
    version: p.version,
  };
};

// --- purchases -----------------------------------------------------------------

const round = (v: number) => Math.round(v);

/** Totals with discount/extra costs allocated by line amount (BIZ-PUR-02). */
export const computePurchase = (db: MockDb, p: PurchaseRecord) => {
  const lines = p.lines.map((l, i) => {
    const product = db.state.storeProducts.find((x) => x.id === l.storeProductId);
    const unit = product?.units.find((u) => u.id === l.storeProductUnitId);
    const baseQtyPerUnit = unit?.baseQty ?? 1;
    const amount = l.costStatus === 'Unknown' || l.unitCost === null ? 0 : round(l.unitCost * l.quantity);
    return { l, i, product, unit, baseQtyPerUnit, qtyBase: l.quantity * baseQtyPerUnit, amount };
  });
  const subtotal = lines.reduce((s, x) => s + x.amount, 0);
  const extra = p.shipping + p.nonRecoverableTax;
  const lineDtos: Dto<'PurchaseLineDto'>[] = lines.map((x) => {
    const share = subtotal > 0 ? x.amount / subtotal : 0;
    const discount = round(p.discount * share);
    const extraShare = round(extra * share);
    return {
      id: x.l.id,
      lineNo: x.i + 1,
      storeProductId: x.l.storeProductId,
      title: x.product ? productTitle(db, x.product) : '—',
      storeProductUnitId: x.l.storeProductUnitId,
      unitName: x.unit?.name ?? '—',
      baseQtyPerUnit: x.baseQtyPerUnit,
      quantity: x.l.quantity,
      qtyBase: x.qtyBase,
      unitCostRials: x.l.unitCost,
      costStatus: x.l.costStatus,
      lineAmountRials: x.amount,
      allocatedDiscountRials: discount,
      allocatedExtraRials: extraShare,
      costPerBaseRials: x.l.costStatus === 'Unknown' || x.qtyBase <= 0 ? null : round((x.amount - discount + extraShare) / x.qtyBase),
      productionDate: x.l.productionDate,
      expiryDate: x.l.expiryDate,
      manufacturerPriceRials: x.l.manufacturerPrice,
      printedPriceRials: x.l.printedPrice,
    };
  });
  return { subtotal, total: subtotal - p.discount + extra, extra, lines: lineDtos };
};

export const toPurchaseDto = (db: MockDb, p: PurchaseRecord): Dto<'PurchaseDto'> => {
  const t = computePurchase(db, p);
  const supplier = p.supplierId ? db.state.suppliers.find((s) => s.id === p.supplierId) : undefined;
  return {
    id: p.id,
    number: p.number,
    kind: p.kind,
    status: p.status,
    supplier: supplier ? { id: supplier.id, name: supplier.name, phone: supplier.phone, note: supplier.note, isArchived: supplier.isArchived } : null,
    supplierInvoiceNo: p.supplierInvoiceNo,
    purchasedAt: p.purchasedAt,
    lines: t.lines,
    subtotalRials: t.subtotal,
    discountRials: p.discount,
    shippingRials: p.shipping,
    nonRecoverableTaxRials: p.nonRecoverableTax,
    totalRials: t.total,
    attachmentFileIds: p.attachmentFileIds,
    note: p.note,
    corrections: [],
    finalizedAt: p.finalizedAt,
    version: p.version,
  };
};

export const toPurchaseSummary = (db: MockDb, p: PurchaseRecord): Dto<'PurchaseSummaryDto'> => {
  const t = computePurchase(db, p);
  return {
    id: p.id,
    number: p.number,
    kind: p.kind,
    status: p.status,
    supplierName: p.supplierId ? (db.state.suppliers.find((s) => s.id === p.supplierId)?.name ?? null) : null,
    supplierInvoiceNo: p.supplierInvoiceNo,
    purchasedAt: p.purchasedAt,
    lineCount: p.lines.length,
    totalRials: t.total,
    hasUnknownCost: p.lines.some((l) => l.costStatus === 'Unknown'),
  };
};

/** Cursor pagination over an in-memory list (cursor = offset). */
export const page = <T>(items: T[], query: URLSearchParams, defaultLimit = 20) => {
  const limit = Math.min(Number(query.get('limit') ?? defaultLimit) || defaultLimit, 100);
  const offset = Number(query.get('cursor') ?? 0) || 0;
  const slice = items.slice(offset, offset + limit);
  return { items: slice, nextCursor: offset + limit < items.length ? String(offset + limit) : null, totalCount: items.length };
};
