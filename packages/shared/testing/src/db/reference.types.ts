import type { Dto } from '@dukani/contracts';

export type Dimension = Dto<'MeasureDimension'>;

export type CategoryRecord = { id: string; key: string; parentId: string | null; name: string; sort: number };

export type ProductTypeRecord = {
  id: string;
  key: string;
  categoryId: string;
  name: string;
  measureDimension: Dimension;
  defaultBaseUnitId: string;
  defaultPackagings: { name: string; baseQty: number }[];
  ownerStoreId: string | null;
};

export type BrandRecord = Dto<'BrandDto'> & { storeTypeId: string | null };

export type CatalogUnitRecord = {
  id: string;
  name: string;
  kind: Dto<'UnitKind'>;
  baseQty: number;
  isSellable: boolean;
  isPurchasable: boolean;
  barcodes: { id: string; code: string; kind: Dto<'BarcodeKind'>; isSample: boolean }[];
};

export type CatalogItemRecord = {
  id: string;
  title: string;
  normalizedTitle: string;
  productTypeId: string;
  brandId: string | null;
  brandStatus: Dto<'BrandStatus'>;
  baseUnitId: string;
  netContentValue: number | null;
  netContentUnitId: string | null;
  units: CatalogUnitRecord[];
  imageFileIds: string[];
  description: string | null;
  status: Dto<'CatalogStatus'>;
  origin: Dto<'CatalogOrigin'>;
  ownerStoreId: string | null;
  keyAttributes: string | null;
};
