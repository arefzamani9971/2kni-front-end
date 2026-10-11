import type { EntrySelection } from '../domain/entry-selection.types';
import type { BulkDraft } from '../domain/bulk-draft';
import type { Dto } from '@dukani/contracts';
import type { OperationId } from '@dukani/domain';
import type { EntryDraft } from '../domain/entry-draft.types';

/** Catalog lookups used by the wizard (read side, one method per endpoint). */
export type EntrySearchFilters = {
  readonly categoryId?: string;
  readonly productTypeId?: string;
  readonly brandId?: string;
};
export type EntryCatalog = {
  units(signal?: AbortSignal): Promise<readonly Dto<'UnitDto'>[]>;
  settings(storeId: string, signal?: AbortSignal): Promise<Dto<'StoreSettingsDto'>>;
  categories(storeId: string, signal?: AbortSignal): Promise<readonly Dto<'CategoryNodeDto'>[]>;
  imageUrl(
    storeId: string,
    itemId: string,
    fileId: string,
    signal?: AbortSignal,
  ): Promise<Dto<'CatalogImageUrlDto'>>;
  storeProducts(
    storeId: string,
    q: string,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<Dto<'CursorPageOfStoreProductSummaryDto'>>;
  catalogItems(
    storeId: string,
    q: string,
    cursor?: string,
    signal?: AbortSignal,
    filters?: EntrySearchFilters,
  ): Promise<Dto<'CursorPageOfCatalogItemSummaryDto'>>;
  storeProduct(storeId: string, productId: string, signal?: AbortSignal): Promise<Dto<'StoreProductDto'>>;
  lookupBarcode(storeId: string, code: string, signal?: AbortSignal): Promise<Dto<'BarcodeLookupDto'>>;
  catalogItem(storeId: string, itemId: string, signal?: AbortSignal): Promise<Dto<'CatalogItemDto'>>;
  storeProductCatalogId(storeId: string, storeProductId: string): Promise<string>;
  productTypes(storeId: string, signal?: AbortSignal): Promise<readonly Dto<'ProductTypeSummaryDto'>[]>;
  productType(storeId: string, productTypeId: string, signal?: AbortSignal): Promise<Dto<'ProductTypeDto'>>;
  brands(storeId: string, signal?: AbortSignal): Promise<readonly Dto<'BrandDto'>[]>;
  titleCheck(storeId: string, title: string, signal?: AbortSignal): Promise<Dto<'TitleCheckDto'>>;
  suppliers(storeId: string, signal?: AbortSignal): Promise<readonly Dto<'SupplierDto'>[]>;
};

/** Commands: server preview (same rules as register) and the idempotent register. */
export type EntryCommands = {
  uploadImage(storeId: string, file: File, signal?: AbortSignal): Promise<Dto<'UploadedFileDto'>>;
  correct(
    storeId: string,
    itemId: string,
    body: Dto<'CreateCorrectionRequest'>,
    operationId: OperationId,
  ): Promise<Dto<'CorrectionRequestDto'>>;
  registerRequest(
    storeId: string,
    body: Dto<'RegisterProductRequest'>,
    operationId: OperationId,
  ): Promise<Dto<'RegisterProductResultDto'>>;
  validateBulk(storeId: string, body: Dto<'BulkRegisterRequest'>): Promise<Dto<'BulkValidationDto'>>;
  registerBulk(
    storeId: string,
    body: Dto<'BulkRegisterRequest'>,
    operationId: OperationId,
  ): Promise<Dto<'BulkRegisterResultDto'>>;
  preview(storeId: string, draft: EntryDraft): Promise<Dto<'RegisterPreviewDto'>>;
  pricePreview(storeId: string, body: Dto<'PricePreviewRequest'>): Promise<Dto<'PricePreviewDto'>>;
  register(
    storeId: string,
    draft: EntryDraft,
    operationId: OperationId,
  ): Promise<Dto<'RegisterProductResultDto'>>;
};

/** Local wizard drafts (IndexedDB), scoped by store + user (BIZ-ACC-05). */
export type EntryDrafts = {
  get(storeId: string, id: string): Promise<EntryDraft | null>;
  save(storeId: string, draft: EntryDraft): Promise<EntryDraft>;
  remove(storeId: string, id: string): Promise<void>;
};

export type BulkDrafts = {
  get(storeId: string): Promise<BulkDraft | null>;
  update(storeId: string, transform: (draft: BulkDraft | null) => BulkDraft): Promise<BulkDraft>;
};

export type EntrySelections = {
  read(storeId: string, itemId: string): Promise<EntrySelection | null>;
  write(storeId: string, itemId: string, value: EntrySelection): Promise<void>;
};
