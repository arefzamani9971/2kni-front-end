import type { Dto } from '@dukani/contracts';
import type { OperationId } from '@dukani/domain';
import type { EntryDraft } from '../domain/entry-draft';

export type StoreMatch = {
  readonly storeProductId: string;
  readonly catalogItemId: string;
  readonly title: string;
  readonly onHandText: string;
  readonly baseUnitName: string;
};

export type CatalogMatch = { readonly catalogItemId: string; readonly title: string; readonly subtitle: string };

export type SearchResult = { readonly inStore: readonly StoreMatch[]; readonly inCatalog: readonly CatalogMatch[] };

/** Catalog lookups used by the wizard (read side, one method per endpoint). */
export type EntryCatalog = {
  search(storeId: string, q: string, signal?: AbortSignal): Promise<SearchResult>;
  lookupBarcode(storeId: string, code: string): Promise<Dto<'BarcodeLookupDto'>>;
  catalogItem(storeId: string, itemId: string): Promise<Dto<'CatalogItemDto'>>;
  storeProductCatalogId(storeId: string, storeProductId: string): Promise<string>;
  productTypes(storeId: string, signal?: AbortSignal): Promise<readonly Dto<'ProductTypeSummaryDto'>[]>;
  productType(storeId: string, productTypeId: string, signal?: AbortSignal): Promise<Dto<'ProductTypeDto'>>;
  brands(storeId: string, signal?: AbortSignal): Promise<readonly Dto<'BrandDto'>[]>;
  titleCheck(storeId: string, title: string, signal?: AbortSignal): Promise<Dto<'TitleCheckDto'>>;
  suppliers(storeId: string, signal?: AbortSignal): Promise<readonly Dto<'SupplierDto'>[]>;
};

/** Commands: server preview (same rules as register) and the idempotent register. */
export type EntryCommands = {
  preview(storeId: string, draft: EntryDraft): Promise<Dto<'RegisterPreviewDto'>>;
  pricePreview(storeId: string, body: Dto<'PricePreviewRequest'>): Promise<Dto<'PricePreviewDto'>>;
  register(storeId: string, draft: EntryDraft, operationId: OperationId): Promise<Dto<'RegisterProductResultDto'>>;
};

/** Local wizard drafts (IndexedDB), scoped by store + user (BIZ-ACC-05). */
export type EntryDrafts = {
  get(storeId: string, id: string): Promise<EntryDraft | null>;
  save(storeId: string, draft: EntryDraft): Promise<EntryDraft>;
  remove(storeId: string, id: string): Promise<void>;
};
