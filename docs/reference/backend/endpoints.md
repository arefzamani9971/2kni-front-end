# Dukani API — endpoints

Generated from controllers by `tools/openapi-gen/gen_openapi.py`. Total: **320** endpoints.

Legend: 🔑 permission · ♻ idempotent (`Idempotency-Key`) · 🌐 anonymous

## Platform (1)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `…/{storeId}/operations/{operationId}` |  | `OperationStatusDto` |  |

## Identity (11)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| POST | `/api/v1/auth/logout` |  | `204` |  |
| POST | `/api/v1/auth/otp/request` | `RequestOtpRequest` | `OtpRequestedDto` | 🌐 |
| POST | `/api/v1/auth/otp/verify` | `VerifyOtpRequest` | `AuthTokensDto` | 🌐 |
| POST | `/api/v1/auth/refresh` | `RefreshTokenRequest` | `AuthTokensDto` | 🌐 |
| GET | `/api/v1/me` |  | `CurrentUserDto` |  |
| PUT | `/api/v1/me` | `UpdateMeRequest` | `CurrentUserDto` |  |
| POST | `/api/v1/me/mobile-change` | `ChangeMobileRequest` | `OtpRequestedDto` |  |
| POST | `/api/v1/me/mobile-change/confirm` | `ConfirmChangeMobileRequest` | `CurrentUserDto` |  |
| GET | `/api/v1/me/sessions` |  | `IReadOnlyList<SessionDto>` |  |
| POST | `/api/v1/me/sessions/revoke-others` |  | `204` |  |
| DELETE | `/api/v1/me/sessions/{sessionId}` |  | `204` |  |

## Stores (31)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| POST | `/api/v1/invitations/{invitationId}/accept` |  | `StoreMembershipDto` |  |
| POST | `/api/v1/invitations/{invitationId}/decline` |  | `204` |  |
| POST | `/api/v1/ownership-transfers/{transferId}/accept` |  | `OwnershipTransferDto` |  |
| POST | `/api/v1/ownership-transfers/{transferId}/decline` |  | `204` |  |
| GET | `/api/v1/permissions` |  | `IReadOnlyList<PermissionInfoDto>` |  |
| GET | `/api/v1/store-types` |  | `IReadOnlyList<StoreTypeDto>` |  |
| GET | `/api/v1/stores` |  | `MyStoresDto` |  |
| POST | `/api/v1/stores` | `CreateStoreRequest` | `StoreDto` | ♻ |
| GET | `…/{storeId}` |  | `StoreDto` |  |
| GET | `…/{storeId}/invitations` |  | `IReadOnlyList<InvitationDto>` |  |
| POST | `…/{storeId}/invitations` | `CreateInvitationRequest` | `InvitationDto` |  |
| POST | `…/{storeId}/invitations/{invitationId}/resend` |  | `InvitationDto` |  |
| POST | `…/{storeId}/invitations/{invitationId}/revoke` |  | `InvitationDto` |  |
| POST | `…/{storeId}/logo` | `UploadStoreLogoRequest` | `StoreDto` | 🔑 `store.settings` |
| GET | `…/{storeId}/members` |  | `IReadOnlyList<MemberDto>` |  |
| GET | `…/{storeId}/members/{memberId}` |  | `MemberDto` |  |
| POST | `…/{storeId}/members/{memberId}/deactivate` | `DeactivateMemberRequest` | `MemberDto` |  |
| GET | `…/{storeId}/members/{memberId}/exit-review` |  | `MemberExitReviewDto` |  |
| PUT | `…/{storeId}/members/{memberId}/permissions` | `UpdatePermissionsRequest` | `MemberDto` |  |
| POST | `…/{storeId}/members/{memberId}/reactivate` |  | `MemberDto` |  |
| POST | `…/{storeId}/ownership-transfers` | `StartOwnershipTransferRequest` | `OwnershipTransferDto` |  |
| GET | `…/{storeId}/ownership-transfers/open` |  | `OwnershipTransferDto?` |  |
| POST | `…/{storeId}/ownership-transfers/{transferId}/cancel` |  | `204` |  |
| GET | `…/{storeId}/private-info` |  | `StorePrivateInfoDto` | 🔑 `store.settings` |
| PUT | `…/{storeId}/private-info` | `StorePrivateInfoDto` | `StorePrivateInfoDto` | 🔑 `store.settings` |
| PUT | `…/{storeId}/profile` | `UpdateStoreProfileRequest` | `StoreDto` | 🔑 `store.settings` |
| GET | `…/{storeId}/settings` |  | `StoreSettingsDto` |  |
| PUT | `…/{storeId}/settings` | `StoreSettingsDto` | `StoreSettingsDto` | 🔑 `store.settings` |
| GET | `…/{storeId}/support-requests` |  | `IReadOnlyList<SupportRequestDto>` |  |
| POST | `…/{storeId}/support-requests` | `CreateSupportRequest` | `SupportRequestDto` |  |
| GET | `…/{storeId}/type-change-preview` | `?Guid` | `StoreTypeChangePreviewDto` | 🔑 `store.settings` |

## Catalog (24)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `…/{storeId}/catalog/brands` | `?string?` | `IReadOnlyList<BrandDto>` |  |
| POST | `…/{storeId}/catalog/brands` | `CreateBrandRequest` | `BrandDto` | 🔑 `product.manage` |
| GET | `…/{storeId}/catalog/categories` |  | `IReadOnlyList<CategoryNodeDto>` |  |
| POST | `…/{storeId}/catalog/categories` | `CreateCategoryRequest` | `CategoryNodeDto` | 🔑 `product.manage` |
| GET | `…/{storeId}/catalog/categories/{categoryId}` |  | `CategoryDetailDto` |  |
| GET | `…/{storeId}/catalog/corrections` |  | `IReadOnlyList<CorrectionRequestDto>` |  |
| GET | `…/{storeId}/catalog/corrections/{correctionId}` |  | `CorrectionRequestDto` |  |
| POST | `…/{storeId}/catalog/corrections/{correctionId}/appeal` | `CorrectionReplyRequest` | `CorrectionRequestDto` |  |
| POST | `…/{storeId}/catalog/corrections/{correctionId}/reply` | `CorrectionReplyRequest` | `CorrectionRequestDto` |  |
| POST | `…/{storeId}/catalog/corrections/{correctionId}/withdraw` |  | `CorrectionRequestDto` |  |
| GET | `…/{storeId}/catalog/items` | `?CatalogSearchQuery` | `CursorPage<CatalogItemSummaryDto>` |  |
| POST | `…/{storeId}/catalog/items` | `CreateCatalogItemRequest` | `CatalogItemDto` | 🔑 `product.manage` |
| GET | `…/{storeId}/catalog/items/title-check` | `?string` | `TitleCheckDto` |  |
| GET | `…/{storeId}/catalog/items/{itemId}` |  | `CatalogItemDto` |  |
| PUT | `…/{storeId}/catalog/items/{itemId}` | `UpdateCatalogItemRequest` | `CatalogItemDto` | 🔑 `product.manage` |
| POST | `…/{storeId}/catalog/items/{itemId}/barcodes` | `AddBarcodeRequest` | `CatalogItemDto` | 🔑 `product.manage` |
| POST | `…/{storeId}/catalog/items/{itemId}/corrections` | `CreateCorrectionRequest` | `CorrectionRequestDto` | 🔑 `product.manage` |
| PUT | `…/{storeId}/catalog/items/{itemId}/images` | `ReplaceImagesRequest` | `CatalogItemDto` | 🔑 `product.manage` |
| POST | `…/{storeId}/catalog/items/{itemId}/packagings` | `AddPackagingRequest` | `CatalogItemDto` | 🔑 `product.manage` |
| GET | `…/{storeId}/catalog/product-types` | `?Guid?` | `IReadOnlyList<ProductTypeSummaryDto>` |  |
| POST | `…/{storeId}/catalog/product-types` | `CreateProductTypeRequest` | `ProductTypeDto` | 🔑 `product.manage` |
| GET | `…/{storeId}/catalog/product-types/{productTypeId}` |  | `ProductTypeDto` |  |
| POST | `…/{storeId}/catalog/product-types/{productTypeId}/submit` | `SubmitForReviewRequest` | `CorrectionRequestDto` | 🔑 `product.manage` |
| GET | `/api/v1/units` |  | `IReadOnlyList<UnitDto>` |  |

## Inventory (24)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `…/{storeId}/barcodes/{code}` |  | `BarcodeLookupDto` |  |
| GET | `…/{storeId}/inventory` | `?InventoryQuery` | `CursorPage<StockLevelDto>` |  |
| POST | `…/{storeId}/inventory/adjustments` | `AdjustStockRequest` | `StockAdjustmentDto` | 🔑 `stock.adjust` ♻ |
| POST | `…/{storeId}/inventory/adjustments/preview` | `AdjustStockRequest` | `AdjustmentPreviewDto` | 🔑 `stock.adjust` |
| GET | `…/{storeId}/inventory/counts` |  | `IReadOnlyList<CountSessionSummaryDto>` |  |
| POST | `…/{storeId}/inventory/counts` | `CreateCountRequest` | `CountSessionDto` |  |
| GET | `…/{storeId}/inventory/counts/{countId}` |  | `CountSessionDto` |  |
| POST | `…/{storeId}/inventory/counts/{countId}/apply` |  | `CountSessionDto` | 🔑 `stock.adjust` ♻ |
| POST | `…/{storeId}/inventory/counts/{countId}/cancel` |  | `204` |  |
| PUT | `…/{storeId}/inventory/counts/{countId}/lines` | `RecordCountsRequest` | `CountSessionDto` |  |
| POST | `…/{storeId}/inventory/counts/{countId}/review` |  | `CountSessionDto` |  |
| GET | `…/{storeId}/inventory/{productId}/movements` | `?MovementQuery` | `CursorPage<StockMovementDto>` |  |
| GET | `…/{storeId}/products` | `?ProductListQuery` | `CursorPage<StoreProductSummaryDto>` |  |
| POST | `…/{storeId}/products/pricing/preview` | `PricePreviewRequest` | `PricePreviewDto` |  |
| GET | `…/{storeId}/products/{productId}` |  | `StoreProductDto` |  |
| POST | `…/{storeId}/products/{productId}/archive` |  | `StoreProductDto` | 🔑 `product.manage` |
| POST | `…/{storeId}/products/{productId}/internal-barcode` | `GenerateInternalBarcodeRequest` | `InternalBarcodeDto` | 🔑 `product.manage` |
| PUT | `…/{storeId}/products/{productId}/local` | `UpdateLocalInfoRequest` | `StoreProductDto` | 🔑 `product.manage` |
| GET | `…/{storeId}/products/{productId}/price-history` |  | `IReadOnlyList<PriceChangeDto>` |  |
| PUT | `…/{storeId}/products/{productId}/pricing` | `SetPricingRequest` | `StoreProductDto` | 🔑 `price.change` |
| PUT | `…/{storeId}/products/{productId}/reorder-settings` | `ReorderSettingsRequest` | `StoreProductDto` | 🔑 `product.manage` |
| POST | `…/{storeId}/products/{productId}/restore` |  | `StoreProductDto` | 🔑 `product.manage` |
| POST | `…/{storeId}/products/{productId}/units` | `AddStoreUnitRequest` | `StoreProductDto` | 🔑 `product.manage` |
| PUT | `…/{storeId}/products/{productId}/units/{unitId}` | `UpdateStoreUnitRequest` | `StoreProductDto` | 🔑 `price.change` |

## Purchasing (22)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| POST | `…/{storeId}/product-entry/bulk` | `BulkRegisterRequest` | `BulkRegisterResultDto` | ♻ |
| POST | `…/{storeId}/product-entry/bulk/validate` | `BulkRegisterRequest` | `BulkValidationDto` |  |
| POST | `…/{storeId}/product-entry/preview` | `RegisterProductRequest` | `RegisterPreviewDto` |  |
| POST | `…/{storeId}/product-entry/register` | `RegisterProductRequest` | `RegisterProductResultDto` | ♻ |
| GET | `…/{storeId}/products/{productId}/receipts` |  | `IReadOnlyList<ProductReceiptHistoryDto>` |  |
| GET | `…/{storeId}/purchases` | `?PurchaseListQuery` | `CursorPage<PurchaseSummaryDto>` |  |
| POST | `…/{storeId}/purchases` | `CreatePurchaseDraftRequest` | `PurchaseDto` |  |
| POST | `…/{storeId}/purchases/quick` | `QuickReceiveRequest` | `PurchaseDto` | ♻ |
| DELETE | `…/{storeId}/purchases/{purchaseId}` |  | `204` |  |
| GET | `…/{storeId}/purchases/{purchaseId}` |  | `PurchaseDto` |  |
| PUT | `…/{storeId}/purchases/{purchaseId}` | `UpdatePurchaseDraftRequest` | `PurchaseDto` |  |
| PUT | `…/{storeId}/purchases/{purchaseId}/attachments` | `SetAttachmentsRequest` | `PurchaseDto` |  |
| POST | `…/{storeId}/purchases/{purchaseId}/cancel` | `CancelPurchaseRequest` | `PurchaseDto` | 🔑 `purchase.correct` ♻ |
| GET | `…/{storeId}/purchases/{purchaseId}/cancel-preview` |  | `PurchaseCorrectionPreviewDto` | 🔑 `purchase.correct` |
| POST | `…/{storeId}/purchases/{purchaseId}/corrections` | `PurchaseCorrectionRequest` | `PurchaseDto` | 🔑 `purchase.correct` ♻ |
| POST | `…/{storeId}/purchases/{purchaseId}/corrections/preview` | `PurchaseCorrectionRequest` | `PurchaseCorrectionPreviewDto` | 🔑 `purchase.correct` |
| POST | `…/{storeId}/purchases/{purchaseId}/finalize` | `FinalizePurchaseRequest` | `PurchaseDto` | ♻ |
| GET | `…/{storeId}/purchases/{purchaseId}/totals` |  | `PurchaseTotalsDto` |  |
| GET | `…/{storeId}/suppliers` | `?string?` | `IReadOnlyList<SupplierDto>` |  |
| POST | `…/{storeId}/suppliers` | `UpsertSupplierRequest` | `SupplierDto` |  |
| PUT | `…/{storeId}/suppliers/{supplierId}` | `UpsertSupplierRequest` | `SupplierDto` |  |
| POST | `…/{storeId}/suppliers/{supplierId}/archive` |  | `204` |  |

## Customers (9)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `…/{storeId}/customers` | `?CustomerListQuery` | `CursorPage<CustomerSummaryDto>` |  |
| POST | `…/{storeId}/customers` | `CreateCustomerRequest` | `CustomerDto` | 🔑 `customer.manage` |
| GET | `…/{storeId}/customers/by-mobile/{mobile}` |  | `CustomerSummaryDto?` |  |
| GET | `…/{storeId}/customers/{customerId}` |  | `CustomerDto` |  |
| PUT | `…/{storeId}/customers/{customerId}` | `UpdateCustomerRequest` | `CustomerDto` | 🔑 `customer.manage` |
| POST | `…/{storeId}/customers/{customerId}/archive` |  | `CustomerDto` | 🔑 `customer.manage` |
| POST | `…/{storeId}/customers/{customerId}/merge` | `MergeCustomersRequest` | `CustomerDto` | 🔑 `customer.merge` ♻ |
| POST | `…/{storeId}/customers/{customerId}/merge/preview` | `MergeCustomersRequest` | `CustomerMergePreviewDto` | 🔑 `customer.merge` |
| POST | `…/{storeId}/customers/{customerId}/restore` |  | `CustomerDto` | 🔑 `customer.manage` |

## Sales (33)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `/api/v1/public/invoices/{token}` |  | `InvoicePrintDto` | 🌐 |
| GET | `…/{storeId}/cheques` | `?ChequeListQuery` | `CursorPage<ChequeSummaryDto>` |  |
| GET | `…/{storeId}/cheques/{chequeId}` |  | `ChequeDto` |  |
| POST | `…/{storeId}/cheques/{chequeId}/bounce` | `BounceChequeRequest` | `ChequeDto` | 🔑 `debt.settle` ♻ |
| POST | `…/{storeId}/cheques/{chequeId}/collect` | `ChequeActionRequest` | `ChequeDto` | 🔑 `debt.settle` ♻ |
| PUT | `…/{storeId}/cheques/{chequeId}/image` | `SetChequeImageRequest` | `ChequeDto` |  |
| POST | `…/{storeId}/cheques/{chequeId}/return` | `ChequeActionRequest` | `ChequeDto` | 🔑 `debt.settle` ♻ |
| GET | `…/{storeId}/customers/{customerId}/ledger` | `?LedgerQuery` | `CursorPage<LedgerEntryDto>` |  |
| GET | `…/{storeId}/customers/{customerId}/open-invoices` |  | `IReadOnlyList<OpenInvoiceDto>` |  |
| POST | `…/{storeId}/customers/{customerId}/settlements` | `SettlementRequest` | `SettlementResultDto` | 🔑 `debt.settle` ♻ |
| POST | `…/{storeId}/customers/{customerId}/settlements/preview` | `SettlementRequest` | `SettlementPreviewDto` | 🔑 `debt.settle` |
| GET | `…/{storeId}/customers/{customerId}/standing` |  | `CustomerStandingDto` |  |
| GET | `…/{storeId}/customers/{customerId}/statement` | `?DateOnly` | `CustomerStatementDto` |  |
| GET | `…/{storeId}/invoices` | `?InvoiceListQuery` | `CursorPage<InvoiceSummaryDto>` |  |
| GET | `…/{storeId}/invoices/{invoiceId}` |  | `InvoiceDto` |  |
| POST | `…/{storeId}/invoices/{invoiceId}/corrections` | `CorrectInvoiceRequest` | `InvoiceDto` | 🔑 `sale.correct` ♻ |
| POST | `…/{storeId}/invoices/{invoiceId}/corrections/preview` | `CorrectInvoiceRequest` | `InvoiceCorrectionPreviewDto` | 🔑 `sale.correct` |
| PUT | `…/{storeId}/invoices/{invoiceId}/customer` | `SetInvoiceCustomerRequest` | `InvoiceDto` | 🔑 `sale.correct` |
| GET | `…/{storeId}/invoices/{invoiceId}/print` |  | `InvoicePrintDto` |  |
| POST | `…/{storeId}/invoices/{invoiceId}/share-links` | `CreateShareLinkRequest` | `ShareLinkDto` |  |
| DELETE | `…/{storeId}/invoices/{invoiceId}/share-links/{linkId}` |  | `204` |  |
| POST | `…/{storeId}/invoices/{invoiceId}/sms` |  | `SmsResultDto` |  |
| GET | `…/{storeId}/payments/{paymentId}` |  | `PaymentDto` |  |
| POST | `…/{storeId}/payments/{paymentId}/reallocate` | `ReallocatePaymentRequest` | `PaymentDto` | 🔑 `debt.settle` ♻ |
| GET | `…/{storeId}/receivables/debtors` | `?DebtorListQuery` | `CursorPage<DebtorDto>` |  |
| GET | `…/{storeId}/receivables/overview` |  | `ReceivablesOverviewDto` |  |
| GET | `…/{storeId}/sale-drafts` |  | `IReadOnlyList<SaleDraftSummaryDto>` |  |
| POST | `…/{storeId}/sale-drafts` | `SaveSaleDraftRequest` | `SaleDraftDto` |  |
| DELETE | `…/{storeId}/sale-drafts/{draftId}` |  | `204` |  |
| GET | `…/{storeId}/sale-drafts/{draftId}` |  | `SaleDraftDto` |  |
| PUT | `…/{storeId}/sale-drafts/{draftId}` | `SaveSaleDraftRequest` | `SaleDraftDto` |  |
| POST | `…/{storeId}/sales` | `CommitSaleRequest` | `SaleResultDto` | 🔑 `sale.cash` ♻ |
| POST | `…/{storeId}/sales/quote` | `QuoteSaleRequest` | `SaleQuoteDto` | 🔑 `sale.cash` |

## Reporting (21)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `…/{storeId}/actions` | `?ActionListQuery` | `CursorPage<ActionItemDto>` |  |
| GET | `…/{storeId}/actions/counts` |  | `ActionCountsDto` |  |
| POST | `…/{storeId}/actions/{actionId}/dismiss` |  | `ActionItemDto` |  |
| POST | `…/{storeId}/actions/{actionId}/snooze` | `SnoozeActionRequest` | `ActionItemDto` |  |
| GET | `…/{storeId}/exports` |  | `IReadOnlyList<ExportJobDto>` | 🔑 `data.export` |
| POST | `…/{storeId}/exports` | `CreateExportRequest` | `ExportJobDto` | 🔑 `data.export` ♻ |
| GET | `…/{storeId}/exports/{exportId}` |  | `ExportJobDto` | 🔑 `data.export` |
| GET | `…/{storeId}/reports/analysis` | `?ReportQuery` | `AnalysisDto` | 🔑 `report.financial` |
| GET | `…/{storeId}/reports/daily-compare` | `?DateOnly` | `DailyCompareDto` |  |
| GET | `…/{storeId}/reports/data-issues` |  | `IReadOnlyList<DataIssueDto>` |  |
| GET | `…/{storeId}/reports/data-issues/{kind}` | `?string?` | `CursorPage<DataIssueItemDto>` |  |
| GET | `…/{storeId}/reports/discounts` | `?ReportQuery` | `DiscountsReportDto` | 🔑 `report.financial` |
| GET | `…/{storeId}/reports/low-stock` |  | `IReadOnlyList<LowStockItemDto>` | 🔑 `stock.view` |
| GET | `…/{storeId}/reports/products` | `?ProductPerformanceQuery` | `ProductPerformanceDto` | 🔑 `report.financial` |
| GET | `…/{storeId}/reports/profit` | `?ReportQuery` | `ProfitReportDto` | 🔑 `report.financial` |
| GET | `…/{storeId}/reports/purchase-vs-sales` | `?ReportQuery` | `PurchaseVsSalesDto` | 🔑 `report.financial` |
| GET | `…/{storeId}/reports/receipts` | `?ReportQuery` | `ReceiptsReportDto` |  |
| GET | `…/{storeId}/reports/sales` | `?ReportQuery` | `SalesReportDto` |  |
| GET | `…/{storeId}/reports/stock-health` |  | `StockHealthDto` | 🔑 `stock.view` |
| GET | `…/{storeId}/reports/stock-value` |  | `StockValueDto` | 🔑 `report.financial` |
| GET | `…/{storeId}/reports/summary` | `?ReportQuery` | `SummaryDto` |  |

## Imports (10)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `…/{storeId}/imports` |  | `IReadOnlyList<ImportHistoryItemDto>` | 🔑 `product.manage` |
| POST | `…/{storeId}/imports` | `ImportUploadForm` | `ImportRunDto` | 🔑 `product.manage` |
| GET | `…/{storeId}/imports/templates/{kind}` |  | `ImportTemplateDto` |  |
| GET | `…/{storeId}/imports/{runId}` |  | `ImportRunDto` |  |
| POST | `…/{storeId}/imports/{runId}/cancel` |  | `ImportRunDto` | 🔑 `product.manage` |
| POST | `…/{storeId}/imports/{runId}/execute` | `ExecuteImportRequest` | `ImportRunDto` | 🔑 `product.manage` ♻ |
| PUT | `…/{storeId}/imports/{runId}/mapping` | `ImportMappingRequest` | `ImportRunDto` | 🔑 `product.manage` |
| GET | `…/{storeId}/imports/{runId}/rows` | `?ImportRowsQuery` | `CursorPage<ImportRowDto>` |  |
| PUT | `…/{storeId}/imports/{runId}/rows/{rowId}` | `FixImportRowRequest` | `ImportRowDto` | 🔑 `product.manage` |
| POST | `…/{storeId}/imports/{runId}/validate` |  | `ImportPreviewDto` | 🔑 `product.manage` |

## Admin (57)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `/api/v1/admin/audit-log` | `?AuditQuery` | `CursorPage<AuditLogEntryDto>` |  |
| GET | `/api/v1/admin/catalog/attributes` |  | `IReadOnlyList<AttributeDefinitionDto>` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/attributes` | `UpsertAttributeRequest` | `AttributeDefinitionDto` | CatalogReviewer |
| PUT | `/api/v1/admin/catalog/attributes/{attributeId}` | `UpsertAttributeRequest` | `AttributeDefinitionDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/attributes/{attributeId}/options` | `UpsertAttributeOptionRequest` | `AttributeDefinitionDto` | CatalogReviewer |
| PUT | `/api/v1/admin/catalog/attributes/{attributeId}/options/{optionId}` | `UpsertAttributeOptionRequest` | `AttributeDefinitionDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/attributes/{attributeId}/options/{optionId}/archive` |  | `AttributeDefinitionDto` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/brands` | `?string?` | `IReadOnlyList<BrandDto>` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/brands` | `UpsertBrandRequest` | `BrandDto` | CatalogReviewer |
| PUT | `/api/v1/admin/catalog/brands/{brandId}` | `UpsertBrandRequest` | `BrandDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/brands/{brandId}/approve` |  | `BrandDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/brands/{brandId}/archive` |  | `204` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/categories` |  | `IReadOnlyList<CategoryNodeDto>` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/categories` | `UpsertCategoryRequest` | `CategoryNodeDto` | CatalogReviewer |
| PUT | `/api/v1/admin/catalog/categories/{categoryId}` | `UpsertCategoryRequest` | `CategoryNodeDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/categories/{categoryId}/archive` |  | `204` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/items` | `?AdminCatalogQuery` | `CursorPage<AdminCatalogItemDto>` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/items/compare` | `?Guid[]` | `CatalogCompareDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/items/merge` | `MergeCatalogItemsRequest` | `AdminCatalogItemDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/items/merge/preview` | `MergeCatalogItemsRequest` | `MergePreviewDto` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/items/{itemId}` |  | `AdminCatalogItemDto` | CatalogReviewer |
| PUT | `/api/v1/admin/catalog/items/{itemId}` | `AdminUpdateCatalogItemRequest` | `AdminCatalogItemDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/items/{itemId}/archive` |  | `204` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/product-types` | `?Guid?` | `IReadOnlyList<ProductTypeSummaryDto>` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/product-types` | `UpsertProductTypeRequest` | `ProductTypeDto` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/product-types/{productTypeId}` |  | `ProductTypeDto` | CatalogReviewer |
| PUT | `/api/v1/admin/catalog/product-types/{productTypeId}` | `UpsertProductTypeRequest` | `ProductTypeDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/product-types/{productTypeId}/archive` |  | `204` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/product-types/{productTypeId}/schema` | `PublishSchemaRequest` | `ProductTypeDto` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/product-types/{productTypeId}/schema-versions` |  | `IReadOnlyList<SchemaVersionDto>` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/product-types/{productTypeId}/schema/preview` | `PublishSchemaRequest` | `SchemaImpactDto` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/review-cases` | `?ReviewQueueQuery` | `CursorPage<ReviewCaseSummaryDto>` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/review-cases/{caseId}` |  | `ReviewCaseDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/review-cases/{caseId}/assign` |  | `ReviewCaseDto` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/review-cases/{caseId}/decision` | `ReviewDecisionRequest` | `ReviewCaseDto` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/store-types` |  | `IReadOnlyList<StoreTypeAdminDto>` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/store-types` | `UpsertStoreTypeRequest` | `StoreTypeAdminDto` | CatalogReviewer |
| PUT | `/api/v1/admin/catalog/store-types/{storeTypeId}` | `UpsertStoreTypeRequest` | `StoreTypeAdminDto` | CatalogReviewer |
| PUT | `/api/v1/admin/catalog/store-types/{storeTypeId}/categories` | `SetStoreTypeCategoriesRequest` | `StoreTypeAdminDto` | CatalogReviewer |
| GET | `/api/v1/admin/catalog/units` |  | `IReadOnlyList<UnitDto>` | CatalogReviewer |
| POST | `/api/v1/admin/catalog/units` | `UpsertUnitRequest` | `UnitDto` | CatalogReviewer |
| PUT | `/api/v1/admin/catalog/units/{unitId}` | `UpsertUnitRequest` | `UnitDto` | CatalogReviewer |
| GET | `/api/v1/admin/dashboard` |  | `AdminDashboardDto` |  |
| GET | `/api/v1/admin/seed-runs` |  | `IReadOnlyList<SeedRunDto>` |  |
| POST | `/api/v1/admin/seed-runs` | `SeedUploadForm` | `SeedRunDto` |  |
| GET | `/api/v1/admin/seed-runs/{runId}` |  | `SeedRunDto` |  |
| POST | `/api/v1/admin/seed-runs/{runId}/apply` |  | `SeedRunDto` |  |
| GET | `/api/v1/admin/seed-runs/{runId}/rows` | `?SeedRowsQuery` | `CursorPage<SeedRunRowDto>` |  |
| GET | `/api/v1/admin/stores` | `?AdminStoreQuery` | `CursorPage<AdminStoreSummaryDto>` |  |
| GET | `/api/v1/admin/stores/{storeId}` |  | `AdminStoreDto` |  |
| POST | `/api/v1/admin/stores/{storeId}/status` | `ChangeStoreStatusRequest` | `AdminStoreDto` |  |
| GET | `/api/v1/admin/support-requests` | `?AdminSupportQuery` | `CursorPage<AdminSupportRequestDto>` |  |
| POST | `/api/v1/admin/support-requests/{requestId}/reply` | `ReplySupportRequest` | `AdminSupportRequestDto` |  |
| GET | `/api/v1/admin/users` | `?AdminUserQuery` | `CursorPage<AdminUserDto>` |  |
| GET | `/api/v1/admin/users/{userId}` |  | `AdminUserDto` |  |
| PUT | `/api/v1/admin/users/{userId}/platform-roles` | `SetPlatformRolesRequest` | `AdminUserDto` |  |
| POST | `/api/v1/admin/users/{userId}/status` | `ChangeUserStatusRequest` | `AdminUserDto` |  |

## Ordering (55)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `/api/v1/customer/addresses` |  | `IReadOnlyList<CustomerAddressDto>` |  |
| POST | `/api/v1/customer/addresses` | `SaveCustomerAddressRequest` | `CustomerAddressDto` |  |
| DELETE | `/api/v1/customer/addresses/{addressId}` |  | `204` |  |
| PUT | `/api/v1/customer/addresses/{addressId}` | `SaveCustomerAddressRequest` | `CustomerAddressDto` |  |
| GET | `/api/v1/customer/orders` | `?CustomerOrderListQuery` | `CursorPage<OrderSummaryDto>` |  |
| GET | `/api/v1/customer/orders/{orderId}` |  | `OrderDto` |  |
| POST | `/api/v1/customer/orders/{orderId}/cancel` | `CustomerCancelOrderRequest` | `OrderDto` | ♻ |
| POST | `/api/v1/customer/orders/{orderId}/payments` | `SubmitTransferReceiptForm` | `OrderPaymentDto` | ♻ |
| POST | `/api/v1/customer/orders/{orderId}/reorder` |  | `ReorderResultDto` |  |
| POST | `/api/v1/customer/orders/{orderId}/revision/accept` | `RevisionDecisionRequest` | `OrderDto` | ♻ |
| POST | `/api/v1/customer/orders/{orderId}/revision/decline` | `RevisionDecisionRequest` | `OrderDto` | ♻ |
| GET | `/api/v1/customer/orders/{orderId}/timeline` |  | `IReadOnlyList<OrderEventDto>` |  |
| GET | `/api/v1/shop/by-code/{code}` |  | `ShopRefDto` | 🌐 |
| GET | `/api/v1/shop/{storeId}` |  | `ShopInfoDto` | 🌐 |
| DELETE | `/api/v1/shop/{storeId}/cart` |  | `204` |  |
| GET | `/api/v1/shop/{storeId}/cart` |  | `ShopCartDto` |  |
| PUT | `/api/v1/shop/{storeId}/cart/lines` | `UpsertCartLinesRequest` | `ShopCartDto` |  |
| DELETE | `/api/v1/shop/{storeId}/cart/lines/{lineId}` |  | `ShopCartDto` |  |
| GET | `/api/v1/shop/{storeId}/categories` |  | `IReadOnlyList<ShopCategoryDto>` | 🌐 |
| POST | `/api/v1/shop/{storeId}/orders` | `PlaceOrderRequest` | `OrderDto` | ♻ |
| GET | `/api/v1/shop/{storeId}/products` | `?ShopProductQuery` | `CursorPage<ShopProductDto>` | 🌐 |
| GET | `/api/v1/shop/{storeId}/products/by-barcode/{code}` |  | `IReadOnlyList<ShopProductDto>` | 🌐 |
| GET | `/api/v1/shop/{storeId}/products/{productId}` |  | `ShopProductDetailDto` | 🌐 |
| GET | `/api/v1/shop/{storeId}/slots` | `?SlotQuery` | `IReadOnlyList<FulfillmentSlotDto>` | 🌐 |
| GET | `…/{storeId}/order-payments` | `?OrderPaymentListQuery` | `CursorPage<OrderPaymentDto>` | 🔑 `order.manage` |
| GET | `…/{storeId}/order-refunds` | `?OrderRefundListQuery` | `CursorPage<OrderRefundDto>` | 🔑 `order.manage` |
| PUT | `…/{storeId}/order-refunds/{refundId}` | `UpdateOrderRefundRequest` | `OrderRefundDto` | 🔑 `order.manage` ♻ |
| GET | `…/{storeId}/orders` | `?OrderListQuery` | `CursorPage<OrderSummaryDto>` | 🔑 `order.manage` |
| GET | `…/{storeId}/orders/counts` |  | `IReadOnlyList<OrderStatusCountDto>` | 🔑 `order.manage` |
| GET | `…/{storeId}/orders/{orderId}` |  | `OrderDto` | 🔑 `order.manage` |
| POST | `…/{storeId}/orders/{orderId}/cancel` | `OrderReasonRequest` | `OrderDto` | 🔑 `order.manage` ♻ |
| POST | `…/{storeId}/orders/{orderId}/confirm` | `ConfirmOrderRequest` | `OrderDto` | 🔑 `order.manage` ♻ |
| POST | `…/{storeId}/orders/{orderId}/deliver` | `DeliverOrderRequest` | `OrderDto` | 🔑 `order.manage` ♻ |
| POST | `…/{storeId}/orders/{orderId}/delivery-failed` | `OrderReasonRequest` | `OrderDto` | 🔑 `order.manage` |
| POST | `…/{storeId}/orders/{orderId}/no-show` | `OrderStepRequest` | `OrderDto` | 🔑 `order.manage` ♻ |
| POST | `…/{storeId}/orders/{orderId}/out-for-delivery` | `OutForDeliveryRequest` | `OrderDto` | 🔑 `order.manage` |
| GET | `…/{storeId}/orders/{orderId}/payments` |  | `IReadOnlyList<OrderPaymentDto>` | 🔑 `order.manage` |
| POST | `…/{storeId}/orders/{orderId}/payments` | `RecordOrderPaymentRequest` | `OrderPaymentDto` | 🔑 `order.manage` ♻ |
| POST | `…/{storeId}/orders/{orderId}/payments/{paymentId}/confirm` | `ReviewOrderPaymentRequest` | `OrderPaymentDto` | 🔑 `order.manage` ♻ |
| POST | `…/{storeId}/orders/{orderId}/payments/{paymentId}/reject` | `RejectOrderPaymentRequest` | `OrderPaymentDto` | 🔑 `order.manage` ♻ |
| POST | `…/{storeId}/orders/{orderId}/preparing` | `OrderStepRequest` | `OrderDto` | 🔑 `order.manage` |
| POST | `…/{storeId}/orders/{orderId}/ready` | `OrderStepRequest` | `OrderDto` | 🔑 `order.manage` |
| POST | `…/{storeId}/orders/{orderId}/reject` | `OrderReasonRequest` | `OrderDto` | 🔑 `order.manage` ♻ |
| POST | `…/{storeId}/orders/{orderId}/reservation/extend` | `ExtendReservationRequest` | `OrderDto` | 🔑 `order.manage` ♻ |
| POST | `…/{storeId}/orders/{orderId}/revisions` | `ProposeRevisionRequest` | `OrderDto` | 🔑 `order.manage` |
| POST | `…/{storeId}/orders/{orderId}/shipped` | `ShipOrderRequest` | `OrderDto` | 🔑 `order.manage` |
| GET | `…/{storeId}/orders/{orderId}/stock-check` |  | `IReadOnlyList<OrderLineAvailabilityDto>` | 🔑 `order.manage` |
| GET | `…/{storeId}/orders/{orderId}/timeline` |  | `IReadOnlyList<OrderEventDto>` | 🔑 `order.manage` |
| GET | `…/{storeId}/storefront` |  | `StorefrontSettingsDto` | 🔑 `store.settings` |
| PUT | `…/{storeId}/storefront` | `UpdateStorefrontSettingsRequest` | `StorefrontSettingsDto` | 🔑 `store.settings` |
| POST | `…/{storeId}/storefront/code/regenerate` |  | `StorefrontSettingsDto` | 🔑 `store.settings` |
| GET | `…/{storeId}/storefront/qr` |  | `StorefrontQrDto` | 🔑 `order.manage` |
| GET | `…/{storeId}/storefront/slot-templates` |  | `IReadOnlyList<SlotTemplateDto>` | 🔑 `order.manage` |
| PUT | `…/{storeId}/storefront/slot-templates` | `ReplaceSlotTemplatesRequest` | `IReadOnlyList<SlotTemplateDto>` | 🔑 `store.settings` |
| GET | `…/{storeId}/storefront/slots` | `?SlotQuery` | `IReadOnlyList<FulfillmentSlotDto>` | 🔑 `order.manage` |

## CustomerPortal (22)

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `/api/v1/customer/claims` | `?RecordClaimQuery` | `CursorPage<RecordClaimDto>` |  |
| POST | `/api/v1/customer/claims` | `CreateRecordClaimRequest` | `RecordClaimDto` |  |
| GET | `/api/v1/customer/invoices` | `?PortalInvoiceQuery` | `CursorPage<PortalInvoiceSummaryDto>` |  |
| GET | `/api/v1/customer/invoices/{invoiceId}` |  | `InvoicePrintDto` |  |
| GET | `/api/v1/customer/settlement-requests` | `?CustomerSettlementQuery` | `CursorPage<CustomerSettlementSummaryDto>` |  |
| POST | `/api/v1/customer/settlement-requests` | `SubmitCustomerSettlementForm` | `CustomerSettlementDto` |  |
| GET | `/api/v1/customer/settlement-requests/{requestId}` |  | `CustomerSettlementDto` |  |
| POST | `/api/v1/customer/settlement-requests/{requestId}/cancel` | `CancelCustomerSettlementRequest` | `CustomerSettlementDto` |  |
| POST | `/api/v1/customer/settlement-requests/{requestId}/reply` | `ReplyCustomerSettlementForm` | `CustomerSettlementDto` |  |
| GET | `/api/v1/customer/stores` |  | `IReadOnlyList<PortalStoreDto>` |  |
| GET | `/api/v1/customer/stores/{storeId}/account` |  | `PortalAccountDto` |  |
| GET | `/api/v1/customer/stores/{storeId}/statement` | `?PortalStatementQuery` | `CustomerStatementDto` |  |
| GET | `…/{storeId}/customer-claims` | `?RecordClaimQuery` | `CursorPage<RecordClaimDto>` | 🔑 `customer.manage` |
| POST | `…/{storeId}/customer-claims/{claimId}/resolve` | `ResolveRecordClaimRequest` | `RecordClaimDto` | 🔑 `customer.manage` |
| GET | `…/{storeId}/portal-settings` |  | `PortalSettingsDto` | 🔑 `store.settings` |
| PUT | `…/{storeId}/portal-settings` | `UpdatePortalSettingsRequest` | `PortalSettingsDto` | 🔑 `store.settings` |
| GET | `…/{storeId}/settlement-requests` | `?StoreSettlementRequestQuery` | `CursorPage<CustomerSettlementSummaryDto>` | 🔑 `debt.settle` |
| GET | `…/{storeId}/settlement-requests/{requestId}` |  | `CustomerSettlementDto` | 🔑 `debt.settle` |
| POST | `…/{storeId}/settlement-requests/{requestId}/approve` | `ApproveCustomerSettlementRequest` | `CustomerSettlementDto` | 🔑 `debt.settle` ♻ |
| POST | `…/{storeId}/settlement-requests/{requestId}/needs-info` | `RequestSettlementInfoRequest` | `CustomerSettlementDto` | 🔑 `debt.settle` |
| POST | `…/{storeId}/settlement-requests/{requestId}/reject` | `RejectCustomerSettlementRequest` | `CustomerSettlementDto` | 🔑 `debt.settle` |
| POST | `…/{storeId}/settlement-requests/{requestId}/start-review` | `StartSettlementReviewRequest` | `CustomerSettlementDto` | 🔑 `debt.settle` |
