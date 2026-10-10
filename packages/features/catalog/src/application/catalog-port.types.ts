import type { OperationId } from '@dukani/domain';
import type {
  CatalogBrand,
  CatalogCategory,
  CatalogItemSummary,
  CatalogType,
  CatalogTypeSummary,
  CatalogUnit,
  NewCatalogType,
} from '../domain/catalog.types';
export type CatalogPort = {
  categories(storeId: string, signal?: AbortSignal): Promise<readonly CatalogCategory[]>;
  types(storeId: string, q?: string, signal?: AbortSignal): Promise<readonly CatalogTypeSummary[]>;
  type(storeId: string, productTypeId: string, signal?: AbortSignal): Promise<CatalogType>;
  units(signal?: AbortSignal): Promise<readonly CatalogUnit[]>;
  brands(storeId: string, q?: string, signal?: AbortSignal): Promise<readonly CatalogBrand[]>;
  items(
    storeId: string,
    q: string,
    productTypeId?: string,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<{ readonly items: readonly CatalogItemSummary[]; readonly nextCursor: string | null }>;
  createCategory(
    storeId: string,
    name: string,
    parentId: string | null,
    operationId: OperationId,
  ): Promise<CatalogCategory>;
  createType(storeId: string, body: NewCatalogType, operationId: OperationId): Promise<CatalogType>;
  createBrand(
    storeId: string,
    name: string,
    operationId: OperationId,
    nameEn?: string,
  ): Promise<CatalogBrand>;
  submitType(storeId: string, productTypeId: string): Promise<void>;
};
