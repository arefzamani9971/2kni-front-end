# Dukani — Domain model, value objects and DTOs

Generated from `src/` by `tools/openapi-gen/gen_domain_doc.py`. Entities are persistence-ignorant C# classes with private setters; state changes only through the listed methods (which enforce the business rules with `Guard`/`DomainException`). DTOs are immutable `record`s serialized as camelCase JSON; enums as strings.
**109 entities · 388 DTO records · 87 enums** across 12 modules.


## Shared kernel

| Type | Kind | Purpose |
|---|---|---|
| `Cursor` | record · `Contracts` | Opaque keyset cursor "(timestamp, id)" used with ORDER BY created_at DESC, id DESC. Clients only pass back the value they received in NextCursor. |
| `CursorPage<T>` | record · `Contracts` | Cursor pagination used by every list endpoint. |
| `DateRangeFilter` | record · `Contracts` |  |
| `AppError` | record · `Errors` | Stable error returned to clients as ProblemDetails (code is the contract, message is Persian UI text). |
| `DomainException` | class · `Errors` | Thrown by domain methods when an invariant is broken; mapped to ProblemDetails by the API. |
| `Guard` | class · `Errors` |  |
| `ErrorCodes` | class · `Errors` | Stable error codes shared with the frontend (i18n keys are derived from these). |
| `Throw` | class · `Errors` | Error factories for services. They RETURN the exception so it is always thrown explicitly:  var invoice = await q.FirstOrDefaultAsync(ct) ?? throw Throw.NotFound("فاکتور"); if (x) throw Throw.Rule(ErrorCodes.StockNotEnough, "موجودی کافی نیست."); |
| `IIntegrationEvent` | interface · `Events` | Written to the outbox in the same transaction as the change; processed by the Worker. |
| `SaleCommitted` | record · `Events` |  |
| `InvoiceCorrected` | record · `Events` |  |
| `PaymentRecorded` | record · `Events` |  |
| `PaymentReversed` | record · `Events` |  |
| `PurchaseFinalized` | record · `Events` |  |
| `PurchaseCorrected` | record · `Events` |  |
| `StockChanged` | record · `Events` |  |
| `ProductCostChanged` | record · `Events` |  |
| `InvoiceSmsRequested` | record · `Events` |  |
| `OtpSmsRequested` | record · `Events` |  |
| `OrderStatusChanged` | record · `Events` |  |
| `OrderDelivered` | record · `Events` |  |
| `CustomerNotificationRequested` | record · `Events` |  |
| `SettlementRequestSubmitted` | record · `Events` |  |
| `Entity` | class · `Primitives` | Base for every table-backed entity. Ids are UUIDv7 (time ordered). |
| `StoreScopedEntity` | class · `Primitives` | Entity that belongs to exactly one store (tenant). Every query is filtered by StoreId. |
| `IAggregateRoot` | interface · `Primitives` | Aggregate root with optimistic concurrency (mapped to PostgreSQL xmin). |
| `IArchivable` | interface · `Primitives` |  |
| `IDomainEvent` | interface · `Primitives` |  |
| `IClock` | interface · `Primitives` |  |
| `DukaniClaims` | class · `Security` | JWT claim names issued by the Identity module and read by the API. |
| `StorePermission` | class · `Security` | Independent staff permissions (BIZ-ACC-02). Owners implicitly have all. |
| `PlatformRole` | class · `Security` |  |
| `Address` | record · `ValueObjects` | Postal address (owned type). Location is optional; manual entry is always possible. |
| `Barcode` | record · `ValueObjects` | Barcode kept as a string (leading zeros preserved). GS1 lengths are check-digit validated. |
| `DateRange` | record · `ValueObjects` | Inclusive range of store business days; queried as a half-open interval [From, To+1). |
| `IranMobile` | record · `ValueObjects` | Iranian mobile number in local form 09xxxxxxxxx (ASCII digits). Letters are rejected, never stripped. |
| `Money` | record · `ValueObjects` | Amount in integer Rials. Never float. UI shows Toman (Rials / 10). |
| `MoneyExtensions` | class · `ValueObjects` |  |
| `OtpCode` | record · `ValueObjects` | Exactly six ASCII digits; leading zero preserved. Format validity says nothing about correctness. |
| `Percent` | record · `ValueObjects` | Percentage such as 25 (= 25%). Markup percent is not profit margin (BIZ-INV-01). |
| `Quantity` | record · `ValueObjects` | Quantity in the item's base unit (numeric(18,3)). Signed values are allowed only for stock movements. |

### Value objects

- **`Address`**(`string? Province`, `string? City`, `string? Line`, `string? PostalCode`, `double? Latitude`, `double? Longitude`) — Postal address (owned type). Location is optional; manual entry is always possible.
- **`Barcode`**() — Barcode kept as a string (leading zeros preserved). GS1 lengths are check-digit validated.
- **`DateRange`**(`DateOnly From`, `DateOnly To`) — Inclusive range of store business days; queried as a half-open interval [From, To+1).
- **`IranMobile`**() — Iranian mobile number in local form 09xxxxxxxxx (ASCII digits). Letters are rejected, never stripped.
- **`Money`**(`long Rials`) — Amount in integer Rials. Never float. UI shows Toman (Rials / 10).
- **`OtpCode`**() — Exactly six ASCII digits; leading zero preserved. Format validity says nothing about correctness.
- **`Percent`**(`decimal Value`) — Percentage such as 25 (= 25%). Markup percent is not profit margin (BIZ-INV-01).
- **`Quantity`**(`decimal Value`) — Quantity in the item's base unit (numeric(18,3)). Signed values are allowed only for stock movements.

## Identity

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `User` | `identity.users` | Entity, IAggregateRoot | `Block`, `ChangeMobile`, `MarkLoggedIn`, `Register`, `Rename`, `SetDefaultStore`, `SetPlatformRoles`, `SetStatus`, `Unblock` |
| `OtpRequest` | `identity.otp_requests` | Entity | `Create`, `Invalidate`, `IsOpen`, `MarkSendFailed`, `MarkSent`, `Verify` |
| `UserSession` | `identity.sessions` | Entity | `IsActive`, `Open`, `Revoke`, `Rotate` |
| `IdentityErrors` | `—` | — | — |

- **User** — identity.users — one person, identified only by a verified mobile (no password, no national id).
- **OtpRequest** — identity.otp_requests — code is stored hashed; a new request invalidates older open ones (BIZ-BUY-02).
- **UserSession** — identity.sessions — one per device; refresh token is rotated and stored hashed (BIZ-BUY-03).
- **IdentityErrors** — Error codes specific to the Identity module (shared ones live in ErrorCodes).

### Enums

| Enum | Values |
|---|---|
| `UserStatus` | Active · Blocked |
| `OtpPurpose` | Login · ChangeMobile |
| `OtpVerifyResult` | Ok · Wrong · Expired · TooManyAttempts · AlreadyUsed |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `RequestOtpRequest` | string Mobile |
| `OtpRequestedDto` | Guid RequestId, string MobileMasked, DateTimeOffset ExpiresAt, DateTimeOffset ResendAvailableAt, int CodeLength, string? DevCode = null |
| `VerifyOtpRequest` | Guid RequestId, string Code, string? DeviceLabel |
| `RefreshTokenRequest` | string RefreshToken |
| `AuthTokensDto` | string AccessToken, DateTimeOffset AccessTokenExpiresAt, string RefreshToken, DateTimeOffset RefreshTokenExpiresAt, CurrentUserDto User, bool IsNewUser |
| `CurrentUserDto` | Guid Id, string Mobile, string? DisplayName, Guid? DefaultStoreId, IReadOnlyList<string> PlatformRoles |
| `UpdateMeRequest` | string? DisplayName, Guid? DefaultStoreId |
| `SessionDto` | Guid Id, string? DeviceLabel, DateTimeOffset CreatedAt, DateTimeOffset LastSeenAt, bool IsCurrent |
| `ChangeMobileRequest` | string NewMobile |
| `ConfirmChangeMobileRequest` | Guid RequestId, string Code |

### Application services

- `IIdentityService` — Use cases of F01 / BIZ-ACC-06 / BIZ-BUY-02..03.

## Stores

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `PermissionCatalog` | `—` | — | `IsKnown`, `TitleOf` |
| `Store` | `store.stores` | Entity, IAggregateRoot | `Activate`, `Create`, `Deactivate`, `SetLogo`, `SetPrivateInfo`, `UpdateProfile` |
| `StorePrivateInfo` | `store.store_private_info` | — | — |
| `StoreSettings` | `store.store_settings` | — | `SetInvoiceFooter`, `Update` |
| `StoreMember` | `store.store_members` | StoreScopedEntity | `Can`, `Disable`, `Reactivate`, `SetPermissions`, `Staff` |
| `Invitation` | `store.invitations` | StoreScopedEntity | `Accept`, `Create`, `Decline`, `EffectiveStatus`, `EnsureAddressedTo`, `IsOpen`, `Revoke`, `Supersede` |
| `OwnershipTransfer` | `store.ownership_transfers` | StoreScopedEntity | `Accept`, `Cancel`, `Decline`, `Expire`, `IsExpired`, `IsOpen`, `Request` |
| `SupportRequest` | `store.support_requests` | StoreScopedEntity | `Answer`, `Close`, `Create` |
| `StoreErrors` | `—` | — | — |

- **PermissionCatalog** — Persian labels of the independent staff permissions (BIZ-ACC-02), in the order of .
- **Store** — store.stores — only name and type are required to start selling (F02).
- **StorePrivateInfo** — store.store_private_info (1:1) — never returned by public endpoints.
- **StoreSettings** — store.store_settings (1:1) — scanning, rounding and alert defaults, and the printed invoice footer.
- **StoreMember** — store.store_members — owner has everything; staff permissions are independent flags (BIZ-ACC-02).
- **Invitation** — store.invitations — Pending → Accepted/Declined/Expired/Revoked (BIZ-ACC-01).
- **OwnershipTransfer** — store.ownership_transfers — owner stays owner until the receiver accepts (BIZ-ACC-03).
- **SupportRequest** — store.support_requests (support, supportdone).
- **StoreErrors** — Error codes specific to the Stores module (shared ones such as LAST_OWNER live in ErrorCodes).

### Owned types / domain records

- `OpeningHoursEntry`(DayOfWeek Day, TimeOnly? Opens, TimeOnly? Closes, bool Closed)

### Enums

| Enum | Values |
|---|---|
| `BusinessMode` | Retail · Wholesale · Both |
| `StoreStatus` | Active · Deactivated |
| `MemberRole` | Owner · Staff |
| `MemberStatus` | Active · Disabled |
| `InvitationStatus` | Pending · Accepted · Declined · Expired · Revoked |
| `OwnershipTransferStatus` | Requested · Accepted · Declined · Expired · Cancelled |
| `ScanMode` | PlusOne · ScanThenQuantity |
| `RoundingDirection` | Nearest · Up · Down |
| `SupportRequestStatus` | Open · Answered · Closed |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `StoreTypeDto` | Guid Id, string Key, string Name |
| `MyStoresDto` | IReadOnlyList<StoreMembershipDto> Stores, IReadOnlyList<PendingInvitationDto> Invitations, IReadOnlyList<PendingOwnershipTransferDto> OwnershipTransfers |
| `StoreMembershipDto` | Guid StoreId, string StoreName, string StoreTypeName, MemberRole Role, bool IsDefault, Guid? LogoFileId |
| `PendingInvitationDto` | Guid InvitationId, Guid StoreId, string StoreName, string? InvitedByName, DateTimeOffset ExpiresAt |
| `PendingOwnershipTransferDto` | Guid TransferId, Guid StoreId, string StoreName, DateTimeOffset ExpiresAt |
| `CreateStoreRequest` | string Name, Guid StoreTypeId, BusinessMode? BusinessMode |
| `AddressDto` | string? Province, string? City, string? Line, string? PostalCode, double? Latitude, double? Longitude |
| `OpeningHoursDto` | DayOfWeek Day, TimeOnly? Opens, TimeOnly? Closes, bool Closed |
| `ProfileCompletionDto` | bool HasContact, bool HasAddress, bool HasHours, bool HasPrivateInfo |
| `StoreDto` | Guid Id, string Name, StoreTypeDto StoreType, BusinessMode? BusinessMode, string? Phone, string? Email, AddressDto? Address, IReadOnlyList<OpeningHoursDto> OpeningHours, Guid? LogoFileId, string TimeZoneId, MemberRole MyRole, IReadOnlyList<string> MyPermissions, ProfileCompletionDto Completion, string? LogoUrl = null |
| `UploadStoreLogoRequest` | IFormFile File |
| `UpdateStoreProfileRequest` | string Name, Guid StoreTypeId, BusinessMode? BusinessMode, string? Phone, string? Email, AddressDto? Address, IReadOnlyList<OpeningHoursDto>? OpeningHours, Guid? LogoFileId |
| `StoreTypeChangePreviewDto` | Guid NewStoreTypeId, int ProductsKept, IReadOnlyList<string> CategoriesNoLongerSuggested |
| `StorePrivateInfoDto` | string? OwnerName, string? NationalId, string? LicenseNo, string? Iban, string? CardNumber |
| `StoreSettingsDto` | ScanMode ScanMode, long? PriceRoundingStepRials, RoundingDirection RoundingDirection, decimal? DefaultLowStockThreshold, decimal? LargeAdjustmentWarnPercent, bool SendInvoiceSmsByDefault, string? InvoiceFooterText = null |
| `PermissionInfoDto` | string Key, string Title, bool IsStaffDefault |
| `MemberDto` | Guid Id, Guid UserId, string? DisplayName, string Mobile, MemberRole Role, MemberStatus Status, IReadOnlyList<string> Permissions, DateTimeOffset JoinedAt |
| `UpdatePermissionsRequest` | IReadOnlyList<string> Permissions |
| `MemberExitReviewDto` | Guid MemberId, int OpenDrafts, int OpenActionItems, int PendingPurchaseDrafts |
| `DeactivateMemberRequest` | Guid? ReassignDraftsToMemberId |
| `InvitationDto` | Guid Id, string Mobile, IReadOnlyList<string> Permissions, InvitationStatus Status, DateTimeOffset ExpiresAt, DateTimeOffset CreatedAt |
| `CreateInvitationRequest` | string Mobile, IReadOnlyList<string>? Permissions |
| `StartOwnershipTransferRequest` | Guid ToMemberId |
| `OwnershipTransferDto` | Guid Id, Guid FromMemberId, Guid ToMemberId, OwnershipTransferStatus Status, DateTimeOffset ExpiresAt |
| `CreateSupportRequest` | string Subject, string Message, string? Context |
| `SupportRequestDto` | Guid Id, string Subject, string Message, SupportRequestStatus Status, DateTimeOffset CreatedAt, string? Reply = null, DateTimeOffset? RepliedAt = null |
| `MemberWorkSummary` | int OpenDrafts = 0, int OpenActionItems = 0, int PendingPurchaseDrafts = 0 |

### Application services

- `IMemberWorkSource` — Port for the member exit review (BIZ-ACC-04): modules that keep per-member work (Sales: sale drafts, Purchasing: purchase drafts, Reporting: assigned actions) implement it and register it with services.AddScoped&lt;IMemberWorkSource, …&gt;(). The Stores module sums all registered sources; with none registered the review shows zeros and reassignment is a no-op.
- `IStoresService` — F02, F03, F56, F72, F78 and BIZ-ACC-01..06.

## Catalog

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `AttributeSchema` | `—` | — | `HasValue`, `MissingRequired`, `NeedsCompletion` |
| `CatalogErrors` | `—` | — | — |
| `CorrectionKeys` | `—` | — | `IsMarker` |
| `CatalogItem` | `catalog.catalog_items` | Entity, IAggregateRoot | `AddPackaging`, `ApplySeed`, `Approve`, `Archive`, `Create`, `MergeInto`, `Reclassify`, `RejectPublication`, `Rename`, `Revise`, `SetDescription`, `SubmitForPublicReview`, `UpdateDetails` |
| `CatalogItemUnit` | `catalog.catalog_item_units` | Entity | `AddBarcode`, `ApplySeed`, `Archive`, `SetSeedKey` |
| `ItemBarcode` | `catalog.barcodes` | Entity | `MakePublic`, `MarkSample` |
| `CatalogImage` | `catalog.catalog_images` | Entity | `Publish`, `Reorder` |
| `CatalogItemAlias` | `catalog.catalog_item_aliases` | — | `Retarget` |
| `CorrectionRequest` | `catalog.correction_requests` | StoreScopedEntity, IAggregateRoot | `Accept`, `Appeal`, `ForItem`, `ForProductType`, `ForPublication`, `Reassign`, `Reject`, `RequestInfo`, `RespondWithInfo`, `StartReview`, `Withdraw` |
| `StoreType` | `catalog.store_types` | Entity | `Create`, `Update` |
| `Unit` | `catalog.units` | Entity | `ApplySeed`, `ConvertTo`, `Create`, `Update` |
| `Category` | `catalog.categories` | Entity | `ApplySeed`, `Archive`, `CreatePrivate`, `CreatePublic`, `MakePublic`, `MoveTo`, `Rename` |
| `StoreTypeCategory` | `catalog.store_type_categories` | — | `SetSort` |
| `ProductType` | `catalog.product_types` | Entity, IAggregateRoot | `AddAttribute`, `ApplySeed`, `Archive`, `AttributesAt`, `Create`, `CreateFromSeed`, `MakePublic`, `PublishSchema`, `RevertToPrivate`, `SubmitForPublicReview`, `Update` |
| `ProductTypeAttribute` | `catalog.product_type_attributes` | Entity | — |
| `AttributeDefinition` | `catalog.attributes` | Entity | `AddOption`, `Create`, `Update` |
| `AttributeOption` | `catalog.attribute_options` | Entity | `Archive`, `Update` |
| `Brand` | `catalog.brands` | Entity | `Archive`, `Create`, `MakePublic`, `Rename` |

- **AttributeSchema** — Pure rules over a product type's attribute schema (BIZ-CAT-04).
- **CatalogErrors** — Catalog-specific error codes (shared codes such as TITLE_DUPLICATE live in ErrorCodes).
- **CorrectionKeys** — Reserved keys inside  and the field names a correction may change.
- **CatalogItem** — catalog.catalog_items — definition of a market product (D03). Has units, barcodes and images, but never stock or purchase cost. Public items are shared by all stores; private ones belong to one store until reviewed.
- **CatalogItemUnit** — catalog.catalog_item_units — the base unit row and packaging levels (bundle of 20 = 20 base units).
- **ItemBarcode** — catalog.barcodes — unique per scope: public codes globally, internal codes per store.
- **CatalogImage** — catalog.catalog_images — store images stay private; public images come from review (BIZ-CAT-06).
- **CatalogItemAlias** — catalog.catalog_item_aliases — after an admin merge, old ids resolve to the surviving item (BIZ-CAT-05).
- **CorrectionRequest** — catalog.correction_requests — Draft → Submitted → Reviewing → NeedInfo/Accepted/Rejected → Appealed (BIZ-CAT-07). Also used for "publish my private item/type" requests.
- **StoreType** — catalog.store_types — stationery, cosmetics, clothing, supermarket (seeded).
- **Unit** — catalog.units — measurement units; each dimension has exactly one reference unit (factor 1).
- **Category** — catalog.categories — group tree (max 3 levels); public or private to one store.
- **StoreTypeCategory** — catalog.store_type_categories — which groups are suggested for which store type.
- **ProductType** — catalog.product_types — the concrete "type of product" (pen, shampoo, rice). It decides the measure dimension, the default base unit, suggested packagings and the attribute schema (versioned, BIZ-CAT-04).
- **ProductTypeAttribute** — catalog.product_type_attributes — attribute of a type in schema versions [SinceVersion, UntilVersion].
- **AttributeDefinition** — catalog.attributes — shared attribute library (color, size, volume…).
- **AttributeOption** — catalog.attribute_options — archived, never deleted, so old items keep their value (BIZ-CAT-04).
- **Brand** — catalog.brands — "unknown brand" is a status on the item, not a row.

### Owned types / domain records

- `AttributeValue`(Guid AttributeId, string? Text, decimal? Number, bool? Bool, List<Guid> OptionIds) — Attribute value stored as JSON on the item; option ids stay valid after an option is archived.
- `CorrectionHistoryEntry`(DateTimeOffset At, CorrectionStatus Status, Guid? By, string? Note)
- `PackagingTemplate`(string NameFa, decimal BaseQty)

### Enums

| Enum | Values |
|---|---|
| `MeasureDimension` | Count · Mass · Volume · Length |
| `CatalogStatus` | Private · PendingReview · Public · Archived |
| `CatalogOrigin` | Seed · Admin · Store |
| `BrandStatus` | Known · Unknown · None |
| `AttributeDataType` | Text · Number · Option · MultiOption · Bool |
| `UnitKind` | Base · Package |
| `BarcodeKind` | Manufacturer · Internal |
| `ImageOrigin` | Public · Store |
| `CorrectionStatus` | Draft · Submitted · Reviewing · NeedInfo · Accepted · Rejected · Appealed · Withdrawn |
| `ReviewCaseKind` | NewCatalogItem · NewProductType · Correction · Appeal |
| `ReviewDecision` | Approve · Reject · NeedInfo |
| `CatalogStatusFilter` | All · Public · PendingReview · Private · Archived |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `AdminCatalogQuery` | string? Q, CatalogStatus? Status, CatalogOrigin? Origin, Guid? ProductTypeId, Guid? OwnerStoreId, string? Cursor, int Limit = 50 |
| `AdminCatalogItemDto` | CatalogItemDto Item, Guid? OwnerStoreId, string? OwnerStoreName, int StoreUsageCount, int OpenCorrections |
| `AdminUpdateCatalogItemRequest` | string Title, Guid ProductTypeId, BrandStatus BrandStatus, Guid? BrandId, Guid BaseUnitId, decimal? NetContentValue, Guid? NetContentUnitId, IReadOnlyList<AttributeValueInput>? Attributes, string? Description |
| `ReviewQueueQuery` | ReviewCaseKind? Kind, CorrectionStatus? Status, Guid? AssignedTo, int? MinAgeHours, string? Cursor, int Limit = 50 |
| `ReviewCaseSummaryDto` | Guid Id, ReviewCaseKind Kind, string Subject, CorrectionStatus Status, string StoreName, Guid? AssignedTo, DateTimeOffset CreatedAt, int AgeHours, int EvidenceCount |
| `FieldDiffDto` | string Field, string? Current, string? Proposed |
| `ReviewCaseDto` | ReviewCaseSummaryDto Summary, CatalogItemDto? CurrentItem, IReadOnlyList<FieldDiffDto> Diff, IReadOnlyList<CatalogItemSummaryDto> PossibleDuplicates, IReadOnlyList<string> BarcodeConflicts, IReadOnlyList<Guid> EvidenceFileIds, IReadOnlyList<CorrectionHistoryDto> History |
| `ReviewDecisionRequest` | ReviewDecision Decision, string? Reason, IReadOnlyDictionary<string, string?>? AcceptedChanges |
| `CatalogCompareDto` | IReadOnlyList<CatalogItemDto> Items, IReadOnlyList<string> SharedBarcodes, bool UnitsCompatible, IReadOnlyList<string> Warnings |
| `MergeCatalogItemsRequest` | Guid TargetItemId, IReadOnlyList<Guid> SourceItemIds |
| `MergePreviewDto` | Guid TargetItemId, int AffectedStores, int AffectedStoreProducts, int AffectedInvoiceLines, bool CanMerge, IReadOnlyList<string> Blockers |
| `UpsertCategoryRequest` | string Name, Guid? ParentId, int Sort, string? SeedKey |
| `UpsertProductTypeRequest` | string Name, Guid CategoryId, Guid DefaultBaseUnitId, IReadOnlyList<PackagingTemplateDto>? DefaultPackagings, string? SeedKey |
| `SchemaAttributeInput` | Guid AttributeId, bool IsRequired, int Sort |
| `PublishSchemaRequest` | IReadOnlyList<SchemaAttributeInput> Attributes |
| `SchemaImpactDto` | Guid ProductTypeId, int CurrentVersion, int NextVersion, int ItemsAffected, int ItemsMissingNewRequired, IReadOnlyList<string> AddedAttributes, IReadOnlyList<string> RemovedAttributes |
| `SchemaVersionDto` | int Version, IReadOnlyList<ProductTypeAttributeDto> Attributes, bool IsCurrent |
| `AttributeDefinitionDto` | Guid Id, string Key, string Name, AttributeDataType DataType, bool IsVariantAxis, string? Note, IReadOnlyList<AttributeOptionDto> Options, int UsedByTypes |
| `UpsertAttributeRequest` | string Key, string Name, AttributeDataType DataType, bool IsVariantAxis, string? Note |
| `UpsertAttributeOptionRequest` | string Key, string Value, string? ColorHex, int Sort |
| `UpsertBrandRequest` | string Name, string? NameEn, string? SeedKey |
| `UpsertUnitRequest` | string Key, string Name, string Symbol, MeasureDimension Dimension, decimal FactorToBase, int MaxDecimals |
| `StoreTypeAdminDto` | Guid Id, string Key, string Name, int Sort, bool IsActive, IReadOnlyList<Guid> CategoryIds |
| `UpsertStoreTypeRequest` | string Key, string Name, int Sort, bool IsActive |
| `SetStoreTypeCategoriesRequest` | IReadOnlyList<Guid> CategoryIds |
| `UnitDto` | Guid Id, string Key, string Name, string Symbol, MeasureDimension Dimension, decimal FactorToBase, int MaxDecimals |
| `CategoryNodeDto` | Guid Id, string Name, Guid? ParentId, int Sort, CatalogStatus Status, int ProductTypeCount, int ProductCount, IReadOnlyList<CategoryNodeDto> Children |
| `CategoryDetailDto` | Guid Id, string Name, IReadOnlyList<CategoryNodeDto> Path, IReadOnlyList<ProductTypeSummaryDto> ProductTypes |
| `CreateCategoryRequest` | string Name, Guid? ParentId |
| `PackagingTemplateDto` | string Name, decimal BaseQty |
| `AttributeOptionDto` | Guid Id, string Key, string Value, string? ColorHex, bool IsArchived |
| `ProductTypeAttributeDto` | Guid AttributeId, string Key, string Name, AttributeDataType DataType, bool IsRequired, bool IsVariantAxis, int Sort, IReadOnlyList<AttributeOptionDto> Options |
| `ProductTypeSummaryDto` | Guid Id, string Name, Guid CategoryId, string CategoryName, MeasureDimension MeasureDimension, CatalogStatus Status, int ItemCount |
| `ProductTypeDto` | Guid Id, string Name, Guid CategoryId, string CategoryName, MeasureDimension MeasureDimension, UnitDto DefaultBaseUnit, IReadOnlyList<UnitDto> AllowedUnits, bool AllowDecimalQuantity, IReadOnlyList<PackagingTemplateDto> DefaultPackagings, int SchemaVersion, IReadOnlyList<ProductTypeAttributeDto> Attributes, CatalogStatus Status |
| `CreateProductTypeRequest` | string Name, Guid CategoryId, Guid DefaultBaseUnitId, IReadOnlyList<PackagingTemplateDto>? DefaultPackagings |
| `SubmitForReviewRequest` | string? Reason |
| `BrandDto` | Guid Id, string Name, string? NameEn, CatalogStatus Status |
| `CreateBrandRequest` | string Name, string? NameEn |
| `CatalogSearchQuery` | string? Q, string? Barcode, Guid? CategoryId, Guid? ProductTypeId, Guid? BrandId, bool? OnlyNotInMyStore, string? Cursor, int Limit = 20 |
| `CatalogItemSummaryDto` | Guid Id, string Title, Guid ProductTypeId, string ProductTypeName, string? BrandName, BrandStatus BrandStatus, string BaseUnitName, string? KeyAttributes, Guid? PrimaryImageFileId, CatalogStatus Status, CatalogOrigin Origin, Guid? MyStoreProductId |
| `AttributeValueDto` | Guid AttributeId, string Key, string Name, string? Text, decimal? Number, bool? Bool, IReadOnlyList<AttributeOptionDto> Options, bool IsObsolete |
| `AttributeValueInput` | Guid AttributeId, string? Text, decimal? Number, bool? Bool, IReadOnlyList<Guid>? OptionIds |
| `BarcodeDto` | Guid Id, string Code, BarcodeKind Kind, bool IsSample |
| `CatalogItemUnitDto` | Guid Id, string Name, UnitKind Kind, decimal BaseQty, bool IsSellable, bool IsPurchasable, IReadOnlyList<BarcodeDto> Barcodes |
| `CatalogImageDto` | Guid Id, Guid FileId, bool IsPrimary, int Sort, ImageOrigin Origin |
| `CatalogItemDto` | Guid Id, string Title, ProductTypeSummaryDto ProductType, BrandDto? Brand, BrandStatus BrandStatus, UnitDto BaseUnit, decimal? NetContentValue, UnitDto? NetContentUnit, IReadOnlyList<AttributeValueDto> Attributes, IReadOnlyList<CatalogItemUnitDto> Units, IReadOnlyList<CatalogImageDto> Images, string? Description, CatalogStatus Status, CatalogOrigin Origin, int SchemaVersion, Guid? MyStoreProductId |
| `PackagingInput` | string Name, decimal BaseQty, string? Barcode, bool IsSellable = true, bool IsPurchasable = true |
| `CreateCatalogItemRequest` | Guid ProductTypeId, string Title, Guid BaseUnitId, BrandStatus BrandStatus, Guid? BrandId, string? BaseBarcode, decimal? NetContentValue, Guid? NetContentUnitId, IReadOnlyList<AttributeValueInput>? Attributes, IReadOnlyList<PackagingInput>? Packagings, IReadOnlyList<Guid>? ImageFileIds, string? Description, bool SubmitForPublicReview |
| `UpdateCatalogItemRequest` | string Title, BrandStatus BrandStatus, Guid? BrandId, decimal? NetContentValue, Guid? NetContentUnitId, IReadOnlyList<AttributeValueInput>? Attributes, string? Description |
| `AddPackagingRequest` | string Name, decimal BaseQty, string? Barcode, bool IsSellable = true, bool IsPurchasable = true |
| `AddBarcodeRequest` | Guid CatalogItemUnitId, string Code |
| `ImageOrderInput` | Guid FileId, bool IsPrimary, int Sort |
| `ReplaceImagesRequest` | IReadOnlyList<ImageOrderInput> Images |
| `TitleCheckDto` | string NormalizedTitle, bool IsAvailable, IReadOnlyList<CatalogItemSummaryDto> SimilarItems |
| `CorrectionHistoryDto` | DateTimeOffset At, CorrectionStatus Status, string? Note |
| `CorrectionRequestDto` | Guid Id, Guid? CatalogItemId, Guid? ProductTypeId, string Subject, CorrectionStatus Status, IReadOnlyDictionary<string, string?> ProposedChanges, string Reason, IReadOnlyList<Guid> EvidenceFileIds, string? DecisionReason, DateTimeOffset CreatedAt, IReadOnlyList<CorrectionHistoryDto> History |
| `CreateCorrectionRequest` | IReadOnlyDictionary<string, string?> ProposedChanges, string Reason, IReadOnlyList<Guid>? EvidenceFileIds |
| `CorrectionReplyRequest` | string Message, IReadOnlyList<Guid>? EvidenceFileIds |
| `CatalogMergeImpact` | int AffectedStores, int AffectedStoreProducts, int AffectedInvoiceLines, int StoresKeepingSeparateProducts |

### Application services

- `ICatalogReferences` — What other modules know about catalog items: store products (Inventory), invoice lines (Sales) and stores (Stores). The Catalog module cannot reference those modules (they reference Catalog), so the implementation lives in the Admin module (which references them) and replaces the no-op default registered by AddCatalogModule.
- `ICatalogAuditTrail` — Audit trail for catalog admin actions (implemented by the Admin module on admin.audit_log; saved with the caller's SaveChanges).
- `ICatalogService` — Seller-facing catalog: taxonomy, catalog search and store-private items (F05, F06, F07, F10, F11, F73).
- `ICatalogAdminService` — Platform admin catalog management (F29, F30, F75; BIZ-ADM-01..07). Used by the Admin module controllers.

## Inventory

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `InternalBarcode` | `—` | — | `CheckDigit`, `FromSequence`, `IsInternal` |
| `StoreProduct` | `inventory.store_products` | StoreScopedEntity, IAggregateRoot | `AddLocalPackaging`, `ApplyReceiptCost`, `Archive`, `CorrectAverageCost`, `Create`, `InitPricing`, `PriceFromFirstCost`, `ReplaceAverageCost`, `Restore`, `SetLocalInfo`, `SetPricing`, `SetReorder` |
| `StoreProductUnit` | `inventory.store_product_units` | Entity | `Archive`, `EffectivePrice`, `SetLocalBarcode`, `Update` |
| `StockLevel` | `inventory.stock_levels` | — | — |
| `StockMovement` | `inventory.stock_movements` | StoreScopedEntity | `Record` |
| `MovingAverage` | `—` | — | `IsReceipt`, `Replay` |
| `PriceChange` | `inventory.price_changes` | StoreScopedEntity | `Record` |
| `StockAdjustment` | `inventory.stock_adjustments` | StoreScopedEntity | `Create` |
| `CountSession` | `inventory.count_sessions` | StoreScopedEntity, IAggregateRoot | `AddToScope`, `Apply`, `Cancel`, `MarkForReview`, `Record`, `Start` |
| `CountLine` | `inventory.count_lines` | — | `FlagRecount` |
| `InventoryErrors` | `—` | — | — |
| `StockReservation` | `inventory.stock_reservations` | StoreScopedEntity | `Consume`, `Create`, `Extend`, `Release` |

- **InternalBarcode** — Store internal barcodes (F68): EAN-13 in the GS1 restricted-circulation range "200" + a 9-digit per-store sequence + check digit, so they never collide with manufacturer codes and are unique per store.
- **StoreProduct** — inventory.store_products — a catalog item inside one store: SKU, local name, price rule, moving average cost and low-stock threshold (D03). Unique per (store, catalog item) so picking an existing item never duplicates it.
- **StoreProductUnit** — inventory.store_product_units — sellable units in this store (from catalog or local) and their price.
- **StockLevel** — inventory.stock_levels (1:1 with store product) — current quantity in base units. Decreases use a conditional UPDATE (on_hand - reserved ≥ qty) so two concurrent sales can never oversell the last unit (BIZ-SALE-10).
- **StockMovement** — inventory.stock_movements — append-only ledger of every stock change with its source document.
- **MovingAverage** — Moving weighted average per base unit (P05). Receipts (opening, purchase, sale-correction returns) move the average; every other movement leaves at the current average, except a reversed purchase receipt, which leaves at its own cost (10 @100 + 10 @200 = avg 150; cancelling the second receipt leaves 10 @100).
- **PriceChange** — inventory.price_changes — history of selling prices (base or per unit).
- **StockAdjustment** — inventory.stock_adjustments — reasoned correction, e.g. 10 → 8 creates a −2 movement (BIZ-INV-04).
- **CountSession** — inventory.count_sessions — light stock count with a snapshot. Uncounted items are untouched; items that moved after the snapshot need a recount before applying (BIZ-INV-05). No global store lock.
- **CountLine** — inventory.count_lines — counted quantity vs snapshot quantity for one product.
- **InventoryErrors** — Error codes specific to the Inventory module (shared codes live in ErrorCodes).
- **StockReservation** — inventory.stock_reservations — stock held for one line of a customer order (3.0, F47, BIZ-ORD-01/06/08). Created only after the seller confirms the latest accepted order version; re-reserving the order replaces its active rows. The sum of active rows per product equals stock_levels.reserved.

### Owned types / domain records

- `PriceRule`(PriceMethod Method, long? ManualPriceRials, decimal? MarkupPercent, long? FixedProfitRials, long? RoundingStepRials, PriceRoundingDirection RoundingDirection) — Selling-price rule (BIZ-INV-01/02): manual; cost × (1 + markup%); cost + fixed profit. Optional rounding. Markup percent is not profit margin: cost 80 + 25% = 100, while a 25% margin would be 106.67.
- `CostMovement`(Guid Id, MovementType Type, decimal QtyBase, decimal BalanceAfter, long? UnitCostRials, bool CostKnown, string RefType, Guid RefId, Guid? RefLineId) — One ledger row as seen by the moving-average replay.
- `MovementCost`(Guid MovementId, long? UnitCostRials, bool CostKnown) — Recomputed cost of one non-receipt movement.
- `CostReplayResult`(long? AverageCostRials, CostStatus CostStatus, IReadOnlyList<MovementCost> ChangedCosts)
- `StockBalance`(decimal OnHand, decimal Reserved) — Stock arithmetic of one product in base units (BIZ-INV-06, BIZ-INV-09). Physical (on hand), active reservations and sellable (available = on hand − reserved) are three distinct values. Example: on hand 10 and reserved 3 → another sale can take at most 7; delivering the reserved order reduces both by 3. The ledger validates every change here (all lines, before writing) and then applies the same delta to the locked row.

### Enums

| Enum | Values |
|---|---|
| `StoreProductStatus` | Active · Archived |
| `CostStatus` | Known · Estimated · Unknown |
| `PriceMethod` | Manual · Markup · FixedProfit |
| `PriceRoundingDirection` | Nearest · Up · Down |
| `MovementType` | Opening · Purchase · Sale · Adjustment · Count · PurchaseCorrection · SaleCorrection · Reversal |
| `AdjustmentReason` | Damage · Loss · EntryError · CountCorrection · Expired · Other |
| `CountStatus` | Draft · Counting · Reviewing · Applied · Cancelled |
| `CountScopeKind` | All · Category · ProductType · Selected |
| `ReservationStatus` | Active · Released · Consumed · Expired |
| `StockState` | Any · InStock · Low · Out |
| `BarcodeLookupKind` | StoreProduct · GlobalCatalog · Multiple · Unknown · Conflict · Invalid |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `ProductListQuery` | string? Q, Guid? CategoryId, Guid? ProductTypeId, StoreProductStatus? Status, StockState StockState, CostStatus? CostStatus, string? Sort, string? Cursor, int Limit = 30 |
| `StoreProductSummaryDto` | Guid Id, string Title, string Sku, string ProductTypeName, string? BrandName, string BaseUnitName, decimal OnHand, decimal Available, long? BaseSalePriceRials, CostStatus CostStatus, bool IsLowStock, StoreProductStatus Status, Guid? PrimaryImageFileId |
| `StoreProductUnitDto` | Guid Id, Guid? CatalogItemUnitId, string Name, decimal BaseQty, long? SalePriceRials, long? EffectivePriceRials, bool IsSellable, IReadOnlyList<string> Barcodes |
| `PriceRuleDto` | PriceMethod Method, long? ManualPriceRials, decimal? MarkupPercent, long? FixedProfitRials, long? RoundingStepRials, PriceRoundingDirection RoundingDirection |
| `StoreProductDto` | Guid Id, Guid CatalogItemId, string Title, string CatalogTitle, string? LocalTitle, string? LocalNote, string Sku, CatalogStatus CatalogStatus, string ProductTypeName, string? BrandName, string BaseUnitName, int BaseUnitMaxDecimals, decimal OnHand, decimal Reserved, decimal Available, long? AverageCostRials, CostStatus CostStatus, PriceRuleDto Pricing, long? BaseSalePriceRials, bool IsBelowCost, decimal? LowStockThreshold, decimal? ReorderTargetQty, bool NoReorder, IReadOnlyList<StoreProductUnitDto> Units, StoreProductStatus Status, uint Version |
| `UpdateLocalInfoRequest` | string? LocalTitle, string? LocalNote |
| `SetPricingRequest` | PriceRuleDto Pricing, string? Reason, IReadOnlyList<UnitPriceInput>? UnitPrices, uint ExpectedVersion |
| `UnitPriceInput` | Guid StoreProductUnitId, long? SalePriceRials, bool IsSellable |
| `PricePreviewRequest` | long? CostPerBaseRials, PriceRuleDto Pricing |
| `PricePreviewDto` | long? ComputedRials, long? FinalRials, decimal? MarginPercent, decimal? MarkupPercent, bool IsBelowCost, bool RequiresCost |
| `PriceChangeDto` | DateTimeOffset ChangedAt, string? UnitName, long? OldPriceRials, long NewPriceRials, string? Reason |
| `AddStoreUnitRequest` | string Name, decimal BaseQty, long? SalePriceRials, string? Barcode |
| `UpdateStoreUnitRequest` | long? SalePriceRials, bool IsSellable |
| `ReorderSettingsRequest` | decimal? LowStockThreshold, decimal? ReorderTargetQty, bool NoReorder |
| `InternalBarcodeDto` | Guid StoreProductUnitId, string Code, bool HadManufacturerBarcode |
| `GenerateInternalBarcodeRequest` | Guid StoreProductUnitId, bool Force |
| `BarcodeMatchDto` | Guid CatalogItemId, Guid CatalogItemUnitId, string Title, string UnitName, decimal BaseQty, Guid? StoreProductId, Guid? StoreProductUnitId, decimal? Available, long? UnitPriceRials, CatalogStatus CatalogStatus |
| `BarcodeLookupDto` | string Code, BarcodeLookupKind Kind, IReadOnlyList<BarcodeMatchDto> Matches, string? Message |
| `InventoryQuery` | string? Q, Guid? CategoryId, StockState StockState, CostStatus? CostStatus, string? Cursor, int Limit = 50 |
| `StockLevelDto` | Guid StoreProductId, string Title, string Sku, string BaseUnitName, decimal OnHand, decimal Reserved, decimal Available, decimal? LowStockThreshold, long? AverageCostRials, CostStatus CostStatus, long? StockValueRials, DateTimeOffset UpdatedAt |
| `MovementQuery` | DateOnly? From, DateOnly? To, MovementType? Type, string? Cursor, int Limit = 50 |
| `StockMovementDto` | Guid Id, DateTimeOffset OccurredAt, MovementType Type, decimal QtyBase, decimal BalanceAfter, long? UnitCostRials, bool CostKnown, string RefType, Guid RefId, string? RefNumber, string? Note |
| `AdjustStockRequest` | Guid StoreProductId, decimal ExpectedSystemQty, decimal ObservedQty, AdjustmentReason Reason, string? Note |
| `AdjustmentPreviewDto` | Guid StoreProductId, decimal SystemQty, decimal ObservedQty, decimal Difference, bool IsLargeDifference, bool SystemQtyChanged |
| `StockAdjustmentDto` | Guid Id, Guid StoreProductId, decimal SystemQty, decimal ObservedQty, decimal Difference, AdjustmentReason Reason, string? Note, DateTimeOffset CreatedAt |
| `CreateCountRequest` | string Title, CountScopeKind ScopeKind, IReadOnlyList<Guid>? ScopeIds |
| `CountLineDto` | Guid StoreProductId, string Title, string BaseUnitName, decimal SnapshotQty, decimal? CountedQty, decimal? Difference, bool NeedsRecount |
| `CountSessionDto` | Guid Id, string Title, CountStatus Status, CountScopeKind ScopeKind, DateTimeOffset SnapshotAt, int ItemsInScope, int ItemsCounted, int ItemsWithDifference, IReadOnlyList<CountLineDto> Lines |
| `CountSessionSummaryDto` | Guid Id, string Title, CountStatus Status, DateTimeOffset SnapshotAt, int ItemsCounted |
| `CountEntryInput` | Guid StoreProductId, decimal CountedQty |
| `RecordCountsRequest` | IReadOnlyList<CountEntryInput> Entries |
| `StockRef` | MovementType Type, string RefType, Guid RefId, Guid? OperationId, DateTimeOffset OccurredAt, DateOnly BusinessDay |
| `StockReceiptLine` | Guid StoreProductId, Guid? RefLineId, decimal QtyBase, long? UnitCostPerBaseRials, CostStatus CostStatus |
| `StockIssueLine` | Guid StoreProductId, Guid? RefLineId, decimal QtyBase |
| `StockIssueResult` | Guid StoreProductId, Guid? RefLineId, long? CostPerBaseRials, bool CostKnown |
| `ReceiptCostRevision` | Guid StoreProductId, Guid RefLineId, long? UnitCostPerBaseRials, CostStatus CostStatus |
| `StockShortage` | Guid StoreProductId, decimal RequestedBaseQty, decimal AvailableBaseQty |
| `SellableUnitSnapshot` | Guid StoreProductId, Guid StoreProductUnitId, string Title, string UnitName, decimal BaseQty, int BaseUnitMaxDecimals, long? UnitPriceRials, decimal Available, bool IsActive, long? AverageCostRials, CostStatus CostStatus |
| `NewStoreProduct` | Guid CatalogItemId, string? LocalTitle, PriceRuleDto? Pricing, IReadOnlyList<CatalogUnitPrice>? UnitPrices, decimal? LowStockThreshold |
| `CatalogUnitPrice` | Guid CatalogItemUnitId, long? SalePriceRials, bool IsSellable |
| `RegisteredStoreProduct` | Guid StoreProductId, string Sku, bool AlreadyExisted |

### Application services

- `IInventoryService` — Store products, prices, barcodes, stock list, movements, adjustments and counts (F11, F15, F16, F61, F68).
- `IStockLedger` — Public stock API for Sales and Purchasing. Must be called inside the caller's transaction. Issue throws STOCK_NOT_ENOUGH instead of allowing negative stock (BIZ-INV-06, BIZ-SALE-10).
- `IStoreProductReader`
- `IStoreProductRegistry` — Creates the store's product for a catalog item (sellable units copied from the catalog item's active units, empty stock level, optional pricing and low-stock threshold) or returns the existing active one. Runs inside the caller's transaction and never moves stock (use IStockLedger.ReceiveAsync for that).

## Purchasing

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `Supplier` | `purchasing.suppliers` | StoreScopedEntity | `Archive`, `Create`, `Update` |
| `Purchase` | `purchasing.purchases` | StoreScopedEntity, IAggregateRoot | `AddCorrection`, `AddLine`, `Cancel`, `CorrectLineCost`, `Discard`, `Finalize`, `Recalculate`, `ReduceLineQuantity`, `RemoveLine`, `SetAttachments`, `SetHeader`, `StartDraft` |
| `PurchaseLine` | `purchasing.purchase_lines` | — | — |
| `PurchaseCorrection` | `purchasing.purchase_corrections` | StoreScopedEntity | `Create` |
| `PurchasingErrors` | `—` | — | — |

- **Supplier** — purchasing.suppliers — optional on every receipt (BIZ-PUR-03).
- **Purchase** — purchasing.purchases — a multi-line receipt; opening stock is the same document with Kind = Opening. Draft → Finalized (atomic for all lines, P06); Finalized → Cancelled only if stock is still free (BIZ-PUR-06). Total = Σ qty×cost − discount + shipping + non-recoverable tax (BIZ-PUR-04).
- **PurchaseLine** — purchasing.purchase_lines — entry unit + quantity; stored also in base units. Production/expiry dates and manufacturer/printed prices belong to this receipt only (D10).
- **PurchaseCorrection** — purchasing.purchase_corrections — audit of cost fixes, quantity reductions and cancellation (F70).
- **PurchasingErrors** — Error codes specific to purchasing and product entry (UPPER_SNAKE; messages are Persian).

### Enums

| Enum | Values |
|---|---|
| `PurchaseKind` | Purchase · Opening |
| `PurchaseStatus` | Draft · Finalized · Cancelled · Discarded |
| `PurchaseCorrectionKind` | CostFix · QuantityReduce · LineRemove · Cancel · Attachments |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `SupplierDto` | Guid Id, string Name, string? Phone, string? Note, bool IsArchived |
| `UpsertSupplierRequest` | string Name, string? Phone, string? Note |
| `PurchaseListQuery` | DateOnly? From, DateOnly? To, Guid? SupplierId, PurchaseStatus? Status, PurchaseKind? Kind, string? Q, string? Cursor, int Limit = 30 |
| `PurchaseSummaryDto` | Guid Id, long? Number, PurchaseKind Kind, PurchaseStatus Status, string? SupplierName, string? SupplierInvoiceNo, DateTimeOffset PurchasedAt, int LineCount, long TotalRials, bool HasUnknownCost |
| `PurchaseLineDto` | Guid Id, int LineNo, Guid StoreProductId, string Title, Guid StoreProductUnitId, string UnitName, decimal BaseQtyPerUnit, decimal Quantity, decimal QtyBase, long? UnitCostRials, CostStatus CostStatus, long LineAmountRials, long AllocatedDiscountRials, long AllocatedExtraRials, long? CostPerBaseRials, DateOnly? ProductionDate, DateOnly? ExpiryDate, long? ManufacturerPriceRials, long? PrintedPriceRials |
| `PurchaseCorrectionDto` | Guid Id, PurchaseCorrectionKind Kind, string Reason, DateTimeOffset CreatedAt |
| `PurchaseDto` | Guid Id, long? Number, PurchaseKind Kind, PurchaseStatus Status, SupplierDto? Supplier, string? SupplierInvoiceNo, DateTimeOffset PurchasedAt, IReadOnlyList<PurchaseLineDto> Lines, long SubtotalRials, long DiscountRials, long ShippingRials, long NonRecoverableTaxRials, long TotalRials, IReadOnlyList<Guid> AttachmentFileIds, string? Note, IReadOnlyList<PurchaseCorrectionDto> Corrections, DateTimeOffset? FinalizedAt, uint Version |
| `PurchaseLineInput` | Guid StoreProductId, Guid StoreProductUnitId, decimal Quantity, long? UnitCostRials, CostStatus CostStatus, DateOnly? ProductionDate, DateOnly? ExpiryDate, long? ManufacturerPriceRials, long? PrintedPriceRials |
| `CreatePurchaseDraftRequest` | PurchaseKind Kind, Guid? SupplierId, string? SupplierInvoiceNo, DateTimeOffset? PurchasedAt, IReadOnlyList<PurchaseLineInput>? Lines |
| `UpdatePurchaseDraftRequest` | Guid? SupplierId, string? SupplierInvoiceNo, DateTimeOffset PurchasedAt, long DiscountRials, long ShippingRials, long NonRecoverableTaxRials, string? Note, IReadOnlyList<PurchaseLineInput> Lines, uint ExpectedVersion |
| `PurchaseTotalsDto` | long SubtotalRials, long DiscountRials, long ExtraCostsRials, long TotalRials, IReadOnlyList<PurchaseLineDto> Lines, Guid? DuplicateOfPurchaseId, IReadOnlyList<string> Warnings |
| `FinalizePurchaseRequest` | uint ExpectedVersion, bool ConfirmDuplicateInvoiceNo, string? DuplicateReason |
| `SetAttachmentsRequest` | IReadOnlyList<Guid> FileIds |
| `LineCorrectionInput` | Guid LineId, long? NewUnitCostRials, CostStatus? NewCostStatus, decimal? NewQuantity |
| `PurchaseCorrectionRequest` | PurchaseCorrectionKind Kind, string Reason, IReadOnlyList<LineCorrectionInput> Lines |
| `PurchaseCorrectionPreviewDto` | bool IsAllowed, IReadOnlyList<string> Blockers, IReadOnlyList<Guid> BlockingProductIds, int AffectedReportDays, IReadOnlyList<string> Effects |
| `CancelPurchaseRequest` | string Reason |
| `QuickReceiveRequest` | PurchaseKind Kind, PurchaseLineInput Line, Guid? SupplierId, string? SupplierInvoiceNo |
| `ProductReceiptHistoryDto` | Guid PurchaseId, long? Number, PurchaseKind Kind, DateTimeOffset PurchasedAt, string? SupplierName, string UnitName, decimal Quantity, decimal QtyBase, long? UnitCostRials, long? CostPerBaseRials, CostStatus CostStatus, DateOnly? ProductionDate, DateOnly? ExpiryDate, long? ManufacturerPriceRials, long? PrintedPriceRials |
| `EntryUnitRef` | Guid? CatalogItemUnitId, int? NewItemUnitIndex |
| `StockEntryInput` | PurchaseKind Kind, EntryUnitRef Unit, decimal Quantity, long? UnitCostRials, CostStatus CostStatus, Guid? SupplierId, string? SupplierInvoiceNo, DateOnly? ProductionDate, DateOnly? ExpiryDate, long? ManufacturerPriceRials, long? PrintedPriceRials |
| `RegisterProductRequest` | Guid? CatalogItemId, CreateCatalogItemRequest? NewCatalogItem, string? LocalTitle, StockEntryInput? Stock, PriceRuleDto? Pricing, decimal? LowStockThreshold |
| `RegisterPreviewDto` | string Title, string BaseUnitName, decimal? QtyBase, string? ConversionText, long? CostPerBaseRials, CostStatus CostStatus, long? SalePriceRials, bool IsBelowCost, TitleCheckDto TitleCheck, Guid? ExistingStoreProductId, IReadOnlyList<string> Warnings |
| `RegisterProductResultDto` | Guid StoreProductId, Guid CatalogItemId, bool CatalogItemCreated, Guid? PurchaseId, string Sku, decimal OnHand, long? SalePriceRials |
| `BulkRegisterRequest` | IReadOnlyList<RegisterProductRequest> Rows |
| `RowErrorDto` | int Row, string Field, string Code, string Message |
| `BulkValidationDto` | int Rows, int Valid, int Warnings, IReadOnlyList<RowErrorDto> Errors |
| `BulkRegisterResultDto` | IReadOnlyList<RegisterProductResultDto> Results, Guid? PurchaseId |
| `RowValidation` | int Row, IReadOnlyList<RowErrorDto> Errors, IReadOnlyList<string> Warnings, Guid? CatalogItemId, Guid? ExistingStoreProductId, bool CreatesCatalogItem, long? LineCostRials |

### Application services

- `IProductRegistrationPort` — Product registration engine shared by the product-entry wizard and the Excel import (F10–F14, F31).  runs inside the CALLER's transaction (e.g. an IOperationGuard work item): it never opens or commits a transaction. All rows or none: any invalid row throws VALIDATION_FAILED / BULK_HAS_ERRORS.
- `IPurchasingService` — Suppliers, receipts, corrections and product entry (F10, F12, F13, F14, F70, F71).

## Customers

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `Customer` | `crm.customers` | StoreScopedEntity, IAggregateRoot | `AbsorbActivity`, `AbsorbBalance`, `ApplyBalanceDelta`, `Archive`, `Create`, `MergeInto`, `RecordPurchase`, `Restore`, `Update` |
| `CustomerMerge` | `crm.customer_merges` | StoreScopedEntity | `Record` |
| `CustomersErrors` | `—` | — | — |

- **Customer** — crm.customers — a store's customer, unique by normalized mobile inside the store (BIZ-CRM-01). Name is optional. BalanceRials is a cache of the receivable (Σ open invoice amounts), maintained in the same transaction as invoices and payments and re-computable at any time.
- **CustomerMerge** — crm.customer_merges — owner-only merge with preview; the old mobile is kept as an alias (BIZ-CRM-01).
- **CustomersErrors** — Error codes specific to the Customers module (shared codes live in ErrorCodes).

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `CustomerListQuery` | string? Q, bool? HasDebt, bool IncludeArchived, string? Sort, string? Cursor, int Limit = 30 |
| `CustomerSummaryDto` | Guid Id, string Mobile, string? Name, long BalanceRials, DateTimeOffset? LastPurchaseAt, bool IsArchived |
| `CustomerStatsDto` | int InvoiceCount, long TotalPurchasesRials, long TotalPaidRials, long OverdueRials, int PendingCheques, long PendingChequesRials |
| `CustomerDto` | Guid Id, string Mobile, string? Name, string? Note, long BalanceRials, DateTimeOffset? LastPurchaseAt, DateTimeOffset? LastPaymentAt, bool IsArchived, CustomerStatsDto Stats, uint Version |
| `CreateCustomerRequest` | string Mobile, string? Name, string? Note |
| `UpdateCustomerRequest` | string Mobile, string? Name, string? Note, uint ExpectedVersion |
| `MergeCustomersRequest` | IReadOnlyList<Guid> SourceCustomerIds |
| `CustomerMergePreviewDto` | Guid TargetCustomerId, int InvoicesToMove, int PaymentsToMove, int OrdersToMove, long BalanceAfterRials, IReadOnlyList<string> Warnings |
| `CustomerSnapshot` | Guid Id, string Mobile, string? Name, long BalanceRials, bool IsArchived |
| `CustomerMergeCounts` | int Invoices, int Payments, int PendingCheques, int Orders = 0 |

### Application services

- `ICustomersService` — Customer list, create, edit, archive, merge (F18, F21, F76).
- `ICustomerAccounts` — Used by Sales inside its transaction to read and update the receivable cache.
- `ICustomerActivityReader` — Invoice/payment/cheque statistics of one customer for the customer file (F21). Implemented by Sales.
- `ICustomerMergeParticipant` — A module holding rows keyed by customer id takes part in a merge (BIZ-CRM-01).  re-points the sources' rows to the target with a set-based UPDATE inside the merge transaction. This is the one sanctioned cross-module write outside the §6 ports: the Customers module owns customer identity, so re-keying is its decision. Amounts are never copied or re-summed, so nothing is counted twice.

## Sales

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `InvoiceCorrectionPlanner` | `—` | — | `PlanLines`, `PlanVoid` |
| `Invoice` | `sales.invoices` | StoreScopedEntity, IAggregateRoot | `ApplyAllocation`, `ApplyCorrection`, `AssignCustomer`, `Create`, `LinkOrder`, `MarkCorrected`, `MarkVoided`, `ReverseAllocation` |
| `InvoiceLine` | `sales.invoice_lines` | — | `BackfillUnknownCost`, `SetCost` |
| `InvoiceCorrection` | `sales.invoice_corrections` | StoreScopedEntity | `Create` |
| `SaleDraft` | `sales.sale_drafts` | StoreScopedEntity, IAggregateRoot | `Create`, `Update` |
| `SmsMessage` | `sales.sms_messages` | StoreScopedEntity | `ForInvoice`, `MarkFailed`, `MarkSent`, `Requeue` |
| `InvoiceShareLink` | `sales.invoice_share_links` | StoreScopedEntity | `Create`, `Revoke` |
| `Payment` | `sales.payments` | StoreScopedEntity, IAggregateRoot | `AllocateTo`, `AssignNumber`, `ConfirmCheque`, `ReassignCustomer`, `Receive`, `ReleaseAllocations`, `Reverse`, `ReverseAndReopen` |
| `PaymentAllocation` | `sales.payment_allocations` | — | — |
| `Cheque` | `sales.cheques` | StoreScopedEntity, IAggregateRoot | `Bounce`, `Collect`, `ReassignCustomer`, `Receive`, `Return`, `SetImage` |
| `ChequeEvent` | `sales.cheque_events` | — | — |
| `SalesErrors` | `—` | — | — |
| `SettlementAllocator` | `—` | — | `Manual`, `OldestFirst`, `SplitAcrossPayments` |

- **InvoiceCorrectionPlanner** — F60 / BIZ-SALE-08: correction of a registration error. The original invoice stays; a correction that would leave the store owing the customer (new total below what was already received, e.g. cash sale 100 corrected to 80) is blocked with CORRECTION_BLOCKED until refunds exist. Void is only possible without any receipt.
- **Invoice** — sales.invoices — a finalized sale. Created together with its stock movements, payments, allocations and the customer balance in ONE transaction (P11). Never deleted; corrections are separate documents (F60). OpenRials = TotalRials − AllocatedRials; a positive open amount is credit (نسیه) and requires a customer (P07).
- **InvoiceLine** — sales.invoice_lines — snapshot of title, unit and price at sale time plus the cost per base unit taken from stock, so later edits never change old invoices and profit is computable (BIZ-SALE-07, R11).
- **InvoiceCorrection** — sales.invoice_corrections — documented correction of a registration error with preview (F60). The original invoice stays; blocked when it would leave the store owing the customer (BIZ-SALE-08). Returns are future scope.
- **SaleDraft** — sales.sale_drafts — named/saved cart; does not reserve stock; revalidated on resume (BIZ-SALE-09).
- **SmsMessage** — sales.sms_messages — sent after the sale commits; failure or retry never touches the sale (F20).
- **InvoiceShareLink** — sales.invoice_share_links — revocable, unguessable link (token stored hashed) (BIZ-BUY-05).
- **Payment** — sales.payments — every received amount (at sale time or later settlement) is one payment row, allocated to one or more invoices. Only the net amount allocated to invoices is recorded; change given back is not (BIZ-SALE-05). A cheque payment is PendingCheque until collected; a bounce reverses its allocations.
- **PaymentAllocation** — sales.payment_allocations — payment → invoice amounts. Moving an allocation reverses and re-creates rows (BIZ-CRM-07).
- **Cheque** — sales.cheques — received cheques (1.0). Not usable cash until collected; bounce re-opens the debt; return hands the cheque back (F38). Issued cheques are added in 2.0 with Direction = Issued.
- **ChequeEvent** — sales.cheque_events — timeline of a cheque.
- **SalesErrors** — Error codes specific to the Sales module (shared codes live in ErrorCodes).
- **SettlementAllocator** — Pure allocation rules of settlements (F22, F23, BIZ-CRM-07, BIZ-CRM-08).

### Owned types / domain records

- `LineRevision`(Guid LineId, decimal? NewQuantity, long? NewUnitPriceRials, bool Remove) — Requested change of one invoice line (null = keep the current value).
- `PlannedLine`(Guid LineId, Guid StoreProductId, string Title, bool Removed, decimal Quantity, decimal QtyBase, long UnitPriceRials, long GrossRials, long LineDiscountRials, long InvoiceDiscountShareRials, long NetRials, decimal DeltaQtyBase, long? CostPerBaseRials, bool CostKnown) — Planned state of a line after the correction. DeltaQtyBase &gt; 0 = more goods leave stock; &lt; 0 = goods return.
- `InvoiceCorrectionPlan`(IReadOnlyList<PlannedLine> Lines, long SubtotalRials, long LineDiscountRials, long InvoiceDiscountRials, long TotalBeforeRials, long TotalAfterRials, long AllocatedRials, long OpenBeforeRials, long OpenAfterRials, bool Void, string? BlockedCode, string? BlockedReason) — Financial and stock effect of a correction, computed without changing anything (F60 preview).
- `InvoiceLineDraft`(Guid StoreProductId, Guid StoreProductUnitId, string Title, string UnitName, decimal BaseQtyPerUnit, decimal Quantity, long ListPriceRials, long UnitPriceRials, string? PriceOverrideReason, long LineDiscountRials) — Input for building an invoice line from a validated sellable unit snapshot.
- `OpenInvoiceSlot`(Guid InvoiceId, long Number, long OpenRials) — An open invoice of the customer, in allocation order (oldest due date, then invoice date — BIZ-CRM-07).
- `AllocationSlice`(Guid InvoiceId, long Number, long OpenBeforeRials, long AmountRials) — Planned amount of a settlement on one invoice.
- `PaymentSlice`(int PaymentIndex, Guid InvoiceId, long AmountRials) — Part of a planned allocation paid by one of the received payments (index into the request's payments).

### Enums

| Enum | Values |
|---|---|
| `InvoiceStatus` | Finalized · Corrected · Voided |
| `PaymentState` | Paid · Partial · Unpaid |
| `DiscountKind` | Amount · Percent |
| `PaymentMethod` | Cash · CardTransfer · Pos · Cheque |
| `PaymentStatus` | Confirmed · PendingCheque · Reversed |
| `PaymentSource` | Sale · Settlement · Order |
| `ChequeDirection` | Received · Issued |
| `ChequeStatus` | Received · Collected · Bounced · Returned |
| `ChequeEventType` | Received · Collected · Bounced · Returned · ImageUpdated |
| `InvoiceCorrectionKind` | ChangeCustomer · LineQuantity · LinePrice · RemoveLine · Void |
| `SmsStatus` | Queued · Sent · Failed |
| `SmsTemplate` | InvoiceReceipt · DebtReminder |
| `DebtorSort` | AmountDesc · OldestDebt · LastPayment · Name |
| `LedgerEntryType` | Invoice · Payment · PaymentReversed · Correction |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `CartLineInput` | Guid StoreProductUnitId, decimal Quantity, long? UnitPriceRials, string? PriceOverrideReason, DiscountKind? DiscountKind, decimal? DiscountValue |
| `PaymentInput` | PaymentMethod Method, long AmountRials, string? Reference, ChequeInput? Cheque |
| `ChequeInput` | string BankName, string ChequeNumber, string? SayadId, string? OwnerName, DateOnly DueDate, Guid? ImageFileId |
| `SaleCartInput` | IReadOnlyList<CartLineInput> Lines, DiscountKind? InvoiceDiscountKind, decimal? InvoiceDiscountValue, long TaxRials, long ShippingRials, Guid? CustomerId, string? CustomerMobile, string? CustomerName, string? Note |
| `QuoteSaleRequest` | SaleCartInput Cart, IReadOnlyList<PaymentInput>? Payments |
| `QuoteLineDto` | int LineNo, Guid StoreProductId, Guid StoreProductUnitId, string Title, string UnitName, decimal Quantity, decimal QtyBase, long ListPriceRials, long UnitPriceRials, long GrossRials, long LineDiscountRials, long NetRials, decimal AvailableBaseQty, bool StockShort, bool PriceChangedSinceCart |
| `SaleIssueDto` | string Code, string Message, int? LineNo |
| `SaleQuoteDto` | IReadOnlyList<QuoteLineDto> Lines, long SubtotalRials, long LineDiscountRials, long InvoiceDiscountRials, long TaxRials, long ShippingRials, long TotalRials, long PaidRials, long CreditRials, long ChangeRials, bool RequiresCustomer, IReadOnlyList<SaleIssueDto> Blocking, IReadOnlyList<SaleIssueDto> Warnings |
| `CommitSaleRequest` | SaleCartInput Cart, IReadOnlyList<PaymentInput> Payments, DateOnly? DueDate, bool SendSms, Guid? DraftId, long ExpectedTotalRials |
| `SaleResultDto` | Guid InvoiceId, long InvoiceNumber, long TotalRials, long PaidRials, long CreditRials, long ChangeRials, Guid? CustomerId, long? CustomerBalanceRials, bool SmsQueued |
| `SaveSaleDraftRequest` | string? Name, SaleCartInput Cart |
| `SaleDraftSummaryDto` | Guid Id, string? Name, int LineCount, long EstimatedTotalRials, string? CustomerName, DateTimeOffset UpdatedAt, string MemberName |
| `SaleDraftDto` | Guid Id, string? Name, SaleCartInput Cart, DateTimeOffset UpdatedAt, uint Version |
| `InvoiceListQuery` | DateOnly? From, DateOnly? To, PaymentState? PaymentState, Guid? CustomerId, Guid? SellerMemberId, long? Number, string? Q, InvoiceStatus? Status, string? Cursor, int Limit = 30 |
| `InvoiceSummaryDto` | Guid Id, long Number, DateTimeOffset IssuedAt, string? CustomerName, long TotalRials, long OpenRials, PaymentState PaymentState, InvoiceStatus Status, int LineCount |
| `InvoiceLineDto` | Guid Id, int LineNo, Guid StoreProductId, string Title, string UnitName, decimal Quantity, decimal QtyBase, long ListPriceRials, long UnitPriceRials, string? PriceOverrideReason, long GrossRials, long LineDiscountRials, long InvoiceDiscountShareRials, long NetRials, long? CostRials, bool CostKnown |
| `InvoicePaymentDto` | Guid PaymentId, PaymentMethod Method, long AllocatedRials, PaymentStatus Status, DateTimeOffset ReceivedAt, Guid? ChequeId |
| `InvoiceCorrectionSummaryDto` | Guid Id, InvoiceCorrectionKind Kind, string Reason, long TotalBeforeRials, long TotalAfterRials, DateTimeOffset CreatedAt, string? ByName |
| `InvoiceDto` | Guid Id, long Number, InvoiceStatus Status, DateTimeOffset IssuedAt, Guid? CustomerId, string? CustomerName, string? CustomerMobile, string? SellerName, IReadOnlyList<InvoiceLineDto> Lines, long SubtotalRials, long LineDiscountRials, long InvoiceDiscountRials, long TaxRials, long ShippingRials, long TotalRials, long PaidRials, long OpenRials, PaymentState PaymentState, DateOnly? DueDate, string? Note, IReadOnlyList<InvoicePaymentDto> Payments, IReadOnlyList<InvoiceCorrectionSummaryDto> Corrections, SmsStatus? LastSmsStatus, uint Version |
| `SetInvoiceCustomerRequest` | Guid? CustomerId, string? CustomerMobile, string? CustomerName, uint Version |
| `SmsResultDto` | Guid SmsId, SmsStatus Status |
| `CreateShareLinkRequest` | int? ValidHours |
| `ShareLinkDto` | Guid Id, string Url, DateTimeOffset ExpiresAt |
| `InvoicePrintDto` | string StoreName, string? StorePhone, string? StoreAddress, string? FooterText, InvoiceDto Invoice, string QrPayload |
| `InvoiceLineChangeInput` | Guid LineId, decimal? NewQuantity, long? NewUnitPriceRials, bool Remove |
| `CorrectInvoiceRequest` | InvoiceCorrectionKind Kind, string Reason, Guid? NewCustomerId, IReadOnlyList<InvoiceLineChangeInput>? Lines, uint Version |
| `InvoiceCorrectionPreviewDto` | long TotalBeforeRials, long TotalAfterRials, long OpenBeforeRials, long OpenAfterRials, IReadOnlyList<StockImpactDto> StockImpact, long? CustomerBalanceAfterRials, bool Allowed, string? BlockedCode, string? BlockedReason |
| `StockImpactDto` | Guid StoreProductId, string Title, decimal DeltaBaseQty, decimal OnHandAfter |
| `SettlementAllocationInput` | Guid InvoiceId, long AmountRials |
| `SettlementRequest` | IReadOnlyList<PaymentInput> Payments, IReadOnlyList<SettlementAllocationInput>? Allocations, string? Note |
| `SettlementAllocationDto` | Guid InvoiceId, long InvoiceNumber, long OpenBeforeRials, long AllocatedRials, long OpenAfterRials |
| `SettlementPreviewDto` | long DebtBeforeRials, long ReceivedRials, long DebtAfterRials, IReadOnlyList<SettlementAllocationDto> Allocations, IReadOnlyList<SaleIssueDto> Blocking |
| `SettlementResultDto` | IReadOnlyList<Guid> PaymentIds, long DebtBeforeRials, long DebtAfterRials, IReadOnlyList<SettlementAllocationDto> Allocations |
| `ReceivablesOverviewDto` | long TotalReceivableRials, int DebtorCount, long OverdueRials, int OverdueCount, long PendingChequesRials, int PendingChequeCount, long CollectedThisMonthRials |
| `DebtorListQuery` | string? Q, DebtorSort Sort = DebtorSort.AmountDesc, bool OverdueOnly = false, string? Cursor = null, int Limit = 30 |
| `DebtorDto` | Guid CustomerId, string DisplayName, string Mobile, long BalanceRials, int OpenInvoiceCount, DateOnly? OldestOpenDay, int? OldestAgeDays, DateTimeOffset? LastPaymentAt, bool Overdue |
| `CustomerStandingDto` | Guid CustomerId, long BalanceRials, int OpenInvoiceCount, long PendingChequesRials, long LifetimeSalesRials, DateTimeOffset? LastPurchaseAt, DateTimeOffset? LastPaymentAt |
| `OpenInvoiceDto` | Guid InvoiceId, long Number, DateTimeOffset IssuedAt, long TotalRials, long OpenRials, DateOnly? DueDate, int AgeDays |
| `LedgerEntryDto` | DateTimeOffset At, LedgerEntryType Type, Guid RefId, string Title, long DebitRials, long CreditRials, long BalanceAfterRials |
| `LedgerQuery` | DateOnly? From, DateOnly? To, string? Cursor, int Limit = 50 |
| `CustomerStatementDto` | Guid CustomerId, string DisplayName, DateOnly From, DateOnly To, long OpeningBalanceRials, IReadOnlyList<LedgerEntryDto> Entries, long ClosingBalanceRials |
| `PaymentAllocationDto` | Guid Id, Guid InvoiceId, long InvoiceNumber, long AmountRials, DateTimeOffset CreatedAt, DateTimeOffset? ReversedAt |
| `PaymentDto` | Guid Id, long? Number, Guid? CustomerId, string? CustomerName, PaymentMethod Method, long AmountRials, PaymentStatus Status, PaymentSource Source, DateTimeOffset ReceivedAt, string? Reference, Guid? ChequeId, IReadOnlyList<PaymentAllocationDto> Allocations, uint Version |
| `ReallocatePaymentRequest` | IReadOnlyList<SettlementAllocationInput> Allocations, string Reason, uint Version |
| `ChequeListQuery` | ChequeStatus? Status, DateOnly? DueFrom, DateOnly? DueTo, Guid? CustomerId, string? Cursor, int Limit = 30 |
| `ChequeSummaryDto` | Guid Id, string BankName, string ChequeNumber, long AmountRials, DateOnly DueDate, ChequeStatus Status, string? CustomerName, int DaysToDue |
| `ChequeEventDto` | ChequeEventType Type, DateTimeOffset OccurredAt, string? Note |
| `ChequeDto` | Guid Id, ChequeDirection Direction, Guid? CustomerId, string? CustomerName, string BankName, string ChequeNumber, string? SayadId, string? OwnerName, long AmountRials, DateOnly DueDate, ChequeStatus Status, string? ImageUrl, Guid PaymentId, IReadOnlyList<PaymentAllocationDto> Allocations, IReadOnlyList<ChequeEventDto> Events, uint Version |
| `ChequeActionRequest` | DateTimeOffset? At, string? Note, uint Version |
| `BounceChequeRequest` | DateTimeOffset? At, string Reason, uint Version |
| `SetChequeImageRequest` | Guid FileId |
| `OrderInvoiceLine` | Guid StoreProductUnitId, decimal Quantity, long UnitPriceRials, long LineDiscountRials, string? Note |
| `OrderInvoicePayment` | PaymentMethod Method, long AmountRials, DateTimeOffset ReceivedAt, string? Reference, ChequeInput? Cheque |
| `OrderInvoiceRequest` | Guid OrderId, long OrderNumber, Guid CustomerId, IReadOnlyList<OrderInvoiceLine> Lines, long InvoiceDiscountRials, long ShippingRials, IReadOnlyList<OrderInvoicePayment> Payments, string? Note |
| `OrderInvoiceResult` | Guid InvoiceId, long InvoiceNumber, long TotalRials, long PaidRials, long CreditRials |
| `SalePermissions` | bool Discount, bool PriceOverride, bool Credit |
| `PricedLine` | int LineNo, CartLineInput Input, SellableUnitSnapshot? Unit, decimal QtyBase, long ListPriceRials, long UnitPriceRials, string? PriceOverrideReason, long GrossRials, long LineDiscountRials, long InvoiceDiscountShareRials, bool StockShort, bool PriceChanged |
| `PaymentPlan` | int Index, PaymentInput Input, long AllocatedRials |
| `PricedSale` | IReadOnlyList<PricedLine> Lines, long SubtotalRials, long LineDiscountRials, long InvoiceDiscountRials, long TaxRials, long ShippingRials, long TotalRials, long PaidRials, long CreditRials, long ChangeRials, bool RequiresCustomer, IReadOnlyList<SaleIssueDto> Blocking, IReadOnlyList<SaleIssueDto> Warnings, IReadOnlyList<PaymentPlan> Payments |

### Application services

- `ISalesService` — Sale flow (F17–F20, F32). CommitAsync runs in ONE transaction under OperationGuard: re-price cart → IStockLedger.IssueAsync (cost snapshot) → Invoice + lines → Payments + allocations → ICustomerAccounts.ApplyBalanceDeltaAsync → outbox SaleCommitted (+ InvoiceSmsRequested).
- `IInvoicesService`
- `IReceivablesService`
- `IPaymentsService`
- `IOrderInvoicing` — Turns a delivered order into exactly one invoice (F49): consumes the order's stock reservation (IStockLedger.ConsumeReservationAsync), creates the invoice with cost snapshots, records the order payments as sales.payments (Source = Order) allocated to it, adds any unpaid remainder to the customer's balance and writes SaleCommitted. Must run inside the caller's transaction; idempotent per OrderId.

## Ordering

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `CustomerAddress` | `ordering.customer_addresses` | Entity, IAggregateRoot | `ClearDefault`, `Create`, `ToFields`, `Update` |
| `OrderAddress` | `—` | — | `From` |
| `BankFormats` | `—` | — | `Compact`, `IsValidCardNumber`, `IsValidPostalCode`, `IsValidSheba`, `Luhn`, `NormalizeSheba` |
| `ShopCart` | `ordering.carts` | StoreScopedEntity, IAggregateRoot | `Clear`, `Create`, `RemoveLine`, `Upsert` |
| `ShopCartLine` | `ordering.cart_lines` | — | — |
| `Order` | `ordering.orders` | StoreScopedEntity, IAggregateRoot | `AcceptRevision`, `AddEvent`, `AddRefundObligation`, `ApplyPaymentConfirmed`, `ApplyPaymentRejected`, `Cancel`, `Confirm`, `DeclineRevision`, `DeliveryFailed`, `DetachSlot`, `Expire`, `ExtendReservation`, `MarkDelivered`, `MarkNoShow`, `MarkOutForDelivery`, `MarkReady`, `MarkReservationReleased`, `MarkShipped`, `PickupCodeMatches`, `Place`, `ProposeRevision`, `RegisterSubmittedPayment`, `Reject`, `ReturnToSeller`, `SetSchedule`, `StartPreparing` |
| `OrderLine` | `ordering.order_lines` | — | — |
| `OrderEvent` | `ordering.order_events` | — | — |
| `OrderMath` | `—` | — | `AdvanceDue`, `Deposit`, `LineTotal`, `Remaining`, `TrimToTotal` |
| `OrderPayment` | `ordering.order_payments` | StoreScopedEntity, IAggregateRoot | `Confirm`, `NormalizeReference`, `Record`, `Reject`, `SubmitTransfer` |
| `OrderRefund` | `ordering.order_refunds` | StoreScopedEntity, IAggregateRoot | `CanMove`, `Create`, `MarkFailed`, `MarkPaid`, `StartProcessing` |
| `OrderNotification` | `ordering.order_notifications` | StoreScopedEntity | `Record` |
| `OrderStateMachine` | `—` | — | `CanMove`, `CustomerMayCancel`, `HoldsReservation`, `IsFinal` |
| `OrderStatusText` | `—` | — | `Of` |
| `OrderingErrors` | `—` | — | — |
| `SlotTemplate` | `ordering.slot_templates` | StoreScopedEntity | `Create` |
| `FulfillmentSlot` | `ordering.fulfillment_slots` | StoreScopedEntity | `Book`, `CanBook`, `Materialize`, `Release` |
| `StorefrontSettings` | `ordering.storefront_settings` | StoreScopedEntity, IAggregateRoot | `ComputeDeposit`, `CreateDefault`, `DeliveryFee`, `GenerateCode`, `IsMethodEnabled`, `IsPaymentAllowed`, `RegenerateCode`, `Update` |

- **CustomerAddress** — ordering.customer_addresses — the customer's own address book (per user, not per store). Orders keep a snapshot, so editing or deleting a book entry never changes an order (BIZ-ORD-04).
- **OrderAddress** — Address snapshot stored on the order (owned columns address_*).
- **BankFormats** — Iranian bank card (16 digits, Luhn), IBAN/Sheba ("IR" + 24 digits, ISO 13616 mod 97) and postal code checks.
- **ShopCart** — ordering.carts — one persistent cart per (customer user, store). It is NOT a reservation: reading it re-validates price, availability and stock and reports what changed (BIZ-ORD-01).
- **ShopCartLine** — ordering.cart_lines — sellable unit, quantity, "allow substitute" preference and note (BIZ-ORD-02).
- **Order** — ordering.orders — a customer order in one store (F46–F50). Lines are versioned: version 1 is the customer's request; each seller revision adds a new version that becomes binding only when the customer accepts exactly that version (a stale version is refused, and no answer never means acceptance). Stock is reserved only when a version is confirmed, released on cancel/expiry and consumed on delivery. Money received before delivery is tracked here and becomes sales revenue only through the invoice made at delivery.
- **OrderLine** — ordering.order_lines — one row per line per version. Rejected lines stay in their version (excluded from totals) so the customer sees the exact diff of quantity, price and total (BIZ-ORD-02).
- **OrderEvent** — ordering.order_events — timeline: every transition with actor, time, from/to and note (BIZ-ORD-05).
- **OrderMath** — Pure money rules of an order (F48): deposit, advance due, remaining and payment trimming for the invoice.
- **OrderPayment** — ordering.order_payments — money for an order before (deposit/advance) or at handover. A card-transfer receipt uploaded by the customer is only a claim (PendingReview) until the seller confirms it (F48). The same transfer reference or receipt file cannot be submitted twice in a store. Confirmed payments become sales payments only at delivery.
- **OrderRefund** — ordering.order_refunds — obligation to return money of a cancelled/expired/rejected order or an overpayment (BIZ-ORD-07): Pending → Processing → Paid | Failed; Failed may be retried (→ Processing). It is closed only with proof (method + reference); releasing a reservation never marks it paid.
- **OrderNotification** — ordering.order_notifications — one row per outbox event sent to the customer (dedupes redelivery; failures stay visible).
- **OrderStateMachine** — Allowed order transitions (state-transitions: سفارش، رزرو، تحویل). In-store and pickup orders may be delivered straight from Confirmed/Preparing without a courier step (F49); only local delivery goes out with a courier and only shipping is shipped. Nothing is ever accepted automatically: AwaitingCustomer only leaves by the customer's answer, a seller action or expiry.
- **OrderStatusText** — Persian status labels used in SMS and DTOs.
- **OrderingErrors** — Error codes specific to ordering (shared ones such as SLOT_FULL or ORDER_VERSION_STALE live in ErrorCodes).
- **SlotTemplate** — ordering.slot_templates — weekly pickup/delivery windows with an optional capacity (BIZ-ORD-03). Concrete dated slots are materialized from templates on demand; editing templates never changes slots that already have bookings.
- **FulfillmentSlot** — ordering.fulfillment_slots — one dated window with its capacity and bookings. Booking is an atomic conditional UPDATE (booked_count &lt; capacity) so two orders never take the last place at the same time (BIZ-ORD-03).
- **StorefrontSettings** — ordering.storefront_settings (1 per store) — QR public code, sales channels, delivery fees and area, minimum order, allowed payment methods, card-transfer destination and deposit policy (F45, BIZ-ORD-03). A delivery method cannot be enabled without its area/fee; card transfer cannot be offered without a valid destination card.

### Owned types / domain records

- `AddressFields`(string? Title, string RecipientName, string Phone, string Province, string City, string AddressLine, string? Plaque, string? UnitNo, string? PostalCode, double? Latitude, double? Longitude) — Address input (book entry or inline at checkout) (BIZ-ORD-04). Location is optional; manual entry always works.
- `OrderLineDraft`(Guid StoreProductId, Guid StoreProductUnitId, string Title, string UnitName, decimal BaseQtyPerUnit, decimal Quantity, long UnitPriceRials, bool AllowSubstitute, string? CustomerNote) — A line as priced from a sellable unit snapshot (cart line, substitute or reorder).
- `OrderLineRevision`(Guid SourceLineId, OrderLineDecision Decision, decimal? NewQuantity, long? NewUnitPriceRials, OrderLineDraft? Substitute, string? SellerNote) — Seller decision for one line of the accepted version (BIZ-ORD-02).
- `OrderChequeInfo`(string BankName, string ChequeNumber, string? SayadId, string? OwnerName, DateOnly DueDate) — Cheque details recorded with a cheque payment of an order.
- `StorefrontSettingsValues`(bool Enabled, bool AcceptingOrders, bool InStoreEnabled, bool PickupEnabled, bool LocalDeliveryEnabled, bool ShippingEnabled, long MinOrderRials, long? LocalDeliveryFeeRials, long? FreeDeliveryAboveRials, string? DeliveryAreaNote, long? ShippingFeeRials, string? ShippingNote, int? PreparationMinutes, bool AcceptCash, bool AcceptPos, bool AcceptCardTransfer, bool AcceptCheque, string? CardNumber, string? Sheba, string? CardHolderName, DepositPolicyKind DepositPolicy, decimal? DepositPercent, long? DepositFixedRials, int ReservationHoldHours, int PickupGraceHours, int RevisionReplyTimeoutHours) — Values the owner sets on the storefront settings page (DELIVERY-SETTINGS, SHOP-S02).

### Enums

| Enum | Values |
|---|---|
| `FulfillmentMethod` | InStore · Pickup · LocalDelivery · Shipping |
| `OrderStatus` | Submitted · AwaitingCustomer · Confirmed · Preparing · ReadyForPickup · OutForDelivery · Shipped · Delivered · Rejected · Cancelled · Expired · NoShow |
| `OrderLineDecision` | Original · Accept · Reject · Substitute · ChangeQty · ChangePrice |
| `OrderActor` | Customer · Seller · System |
| `OrderEventKind` | StatusChanged · RevisionProposed · RevisionAccepted · RevisionDeclined · ScheduleSet · ReservationExtended · ReservationReleased · PaymentSubmitted · PaymentRecorded · PaymentConfirmed · PaymentRejected · RefundCreated · RefundUpdated · InvoiceCreated |
| `OrderPaymentMethod` | Cash · Pos · CardTransfer · Cheque |
| `OrderPaymentKind` | Deposit · Payment |
| `OrderPaymentStatus` | PendingReview · Confirmed · Rejected |
| `OrderPaymentPlan` | OnDelivery · Deposit · Full |
| `DepositPolicyKind` | None · Percent · Fixed |
| `OrderRefundStatus` | Pending · Processing · Paid · Failed |
| `OrderRefundReason` | Cancelled · Rejected · Expired · NoShow · Overpaid |
| `ShopCartIssue` | Unavailable · NoPrice · PriceIncreased · PriceDecreased · OutOfStock · NotEnoughStock |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `OrderAddressDto` | string? Title, string RecipientName, string Phone, string Province, string City, string AddressLine, string? Plaque, string? UnitNo, string? PostalCode, double? Latitude, double? Longitude |
| `OrderLineDto` | Guid Id, int VersionNo, int LineNo, Guid StoreProductId, Guid StoreProductUnitId, string Title, string UnitName, decimal Quantity, long UnitPriceRials, long LineTotalRials, bool Included, bool AllowSubstitute, string? CustomerNote, OrderLineDecision Decision, Guid? PreviousLineId, decimal? PreviousQuantity, long? PreviousUnitPriceRials, string? SellerNote |
| `OrderRevisionDto` | int VersionNo, IReadOnlyList<OrderLineDto> Lines, long SubtotalRials, long DeliveryFeeRials, long TotalRials, long TotalDiffRials, DateTimeOffset? ScheduledStart, DateTimeOffset? ScheduledEnd, string? Note, DateTimeOffset? ProposedAt, DateTimeOffset? ExpiresAt |
| `OrderMoneyDto` | long SubtotalRials, long DeliveryFeeRials, long TotalRials, long AdvanceDueRials, long PaidRials, long PendingReviewRials, long RefundObligationRials, long RemainingRials, long AdvanceOutstandingRials |
| `OrderDeliveryDto` | DateTimeOffset? ScheduledStart, DateTimeOffset? ScheduledEnd, Guid? SlotId, string? CourierName, string? CourierPhone, string? Carrier, string? TrackingCode, DateTimeOffset? ShippedAt, DateTimeOffset? DeliveredAt, string? DeliveredToName, string? DeliveryReference |
| `OrderPaymentDto` | Guid Id, Guid OrderId, OrderPaymentMethod Method, OrderPaymentKind Kind, long AmountRials, OrderPaymentStatus Status, OrderActor SubmittedBy, string? Reference, string? ReceiptUrl, DateTimeOffset? TransferredAt, string? PayerCardLast4, string? ChequeBankName, string? ChequeNumber, DateOnly? ChequeDueDate, string? Note, string? RejectReason, DateTimeOffset SubmittedAt, DateTimeOffset? ConfirmedAt, uint Version |
| `OrderRefundDto` | Guid Id, Guid OrderId, long OrderNumber, long AmountRials, OrderRefundReason Reason, OrderRefundStatus Status, OrderPaymentMethod? Method, string? Reference, string? ResponsibleName, DateTimeOffset? PaidAt, string? FailureReason, string? Note, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, uint Version |
| `OrderDto` | Guid Id, Guid StoreId, string StoreName, long Number, FulfillmentMethod Method, OrderStatus Status, string StatusText, Guid CustomerId, string CustomerMobile, string? CustomerName, OrderAddressDto? Address, OrderPaymentMethod PaymentMethod, OrderPaymentPlan PaymentPlan, int AcceptedVersionNo, IReadOnlyList<OrderLineDto> Lines, OrderRevisionDto? PendingRevision, OrderMoneyDto Money, OrderDeliveryDto Delivery, bool ReservationActive, DateTimeOffset? ReservationExpiresAt, string? PickupCode, Guid? InvoiceId, long? InvoiceNumber, string? CustomerNote, string? CancelReason, OrderActor? CancelledBy, string? RejectReason, DateTimeOffset SubmittedAt, DateTimeOffset? ConfirmedAt, DateTimeOffset LastStatusAt, IReadOnlyList<OrderPaymentDto> Payments, IReadOnlyList<OrderRefundDto> Refunds, uint Version |
| `OrderSummaryDto` | Guid Id, Guid StoreId, string? StoreName, long Number, FulfillmentMethod Method, OrderStatus Status, string StatusText, string CustomerMobile, string? CustomerName, int ItemCount, long TotalRials, long PaidRials, long PendingReviewRials, DateTimeOffset? ScheduledStart, DateTimeOffset? ReservationExpiresAt, DateTimeOffset SubmittedAt, DateTimeOffset LastStatusAt |
| `OrderEventDto` | Guid Id, OrderEventKind Kind, OrderStatus? FromStatus, OrderStatus? ToStatus, OrderActor Actor, string? Note, DateTimeOffset OccurredAt |
| `OrderStatusCountDto` | OrderStatus Status, int Count |
| `OrderLineAvailabilityDto` | Guid LineId, Guid StoreProductId, string Title, decimal RequestedBaseQty, decimal AvailableBaseQty, bool IsActive, bool Sufficient, long? CurrentUnitPriceRials |
| `OrderListQuery` | OrderStatus? Status, FulfillmentMethod? Method, string? Q, DateOnly? From, DateOnly? To, string? Cursor = null, int Limit = 30 |
| `CustomerOrderListQuery` | OrderStatus? Status, Guid? StoreId, string? Cursor = null, int Limit = 30 |
| `OrderPaymentListQuery` | OrderPaymentStatus? Status, string? Cursor = null, int Limit = 30 |
| `OrderRefundListQuery` | OrderRefundStatus? Status, string? Cursor = null, int Limit = 30 |
| `OrderAddressInput` | string? Title, string RecipientName, string Phone, string Province, string City, string AddressLine, string? Plaque, string? UnitNo, string? PostalCode, double? Latitude, double? Longitude, bool SaveToBook |
| `PlaceOrderRequest` | FulfillmentMethod Method, OrderPaymentMethod PaymentMethod, OrderPaymentPlan PaymentPlan, Guid? AddressId, OrderAddressInput? Address, Guid? SlotId, string? CustomerName, string? Note, long ExpectedTotalRials |
| `RevisionDecisionRequest` | int VersionNo, string? Reason |
| `CustomerCancelOrderRequest` | string Reason |
| `SubmitTransferReceiptForm` | long AmountRials, OrderPaymentKind Kind, string? Reference, DateTimeOffset? TransferredAt, string? PayerCardLast4, string? Note, IFormFile? File |
| `ReorderSkippedLineDto` | string Title, string UnitName, decimal Quantity, string Reason |
| `ReorderResultDto` | ShopCartDto Cart, IReadOnlyList<ReorderSkippedLineDto> Skipped, int PriceChangedCount |
| `ConfirmOrderRequest` | uint Version, Guid? SlotId, DateTimeOffset? ScheduledStart, DateTimeOffset? ScheduledEnd, int? HoldHours, string? Note |
| `RevisionLineInput` | Guid LineId, OrderLineDecision Decision, decimal? NewQuantity, long? NewUnitPriceRials, Guid? SubstituteStoreProductUnitId, string? SellerNote |
| `ProposeRevisionRequest` | uint Version, IReadOnlyList<RevisionLineInput> Lines, long? DeliveryFeeRials, DateTimeOffset? ScheduledStart, DateTimeOffset? ScheduledEnd, string? Note |
| `OrderReasonRequest` | uint Version, string Reason |
| `OrderStepRequest` | uint Version, string? Note |
| `OutForDeliveryRequest` | uint Version, string? CourierName, string? CourierPhone, string? Note |
| `ShipOrderRequest` | uint Version, string Carrier, string TrackingCode, string? Note |
| `OrderChequeInput` | string BankName, string ChequeNumber, string? SayadId, string? OwnerName, DateOnly DueDate |
| `HandoverPaymentInput` | OrderPaymentMethod Method, long AmountRials, string? Reference, OrderChequeInput? Cheque |
| `DeliverOrderRequest` | uint Version, string? PickupCode, string? RecipientName, string? DeliveryReference, IReadOnlyList<HandoverPaymentInput>? Payments, string? Note |
| `ExtendReservationRequest` | uint Version, DateTimeOffset NewExpiresAt, string? Reason |
| `RecordOrderPaymentRequest` | OrderPaymentMethod Method, OrderPaymentKind Kind, long AmountRials, string? Reference, OrderChequeInput? Cheque, string? Note |
| `ReviewOrderPaymentRequest` | string? Note |
| `RejectOrderPaymentRequest` | string Reason |
| `UpdateOrderRefundRequest` | uint Version, OrderRefundStatus Status, OrderPaymentMethod? Method, string? Reference, DateTimeOffset? PaidAt, string? ResponsibleName, string? FailureReason, string? Note |
| `StorefrontSettingsDto` | Guid StoreId, string PublicCode, string PublicUrl, bool Enabled, bool AcceptingOrders, bool InStoreEnabled, bool PickupEnabled, bool LocalDeliveryEnabled, bool ShippingEnabled, long MinOrderRials, long? LocalDeliveryFeeRials, long? FreeDeliveryAboveRials, string? DeliveryAreaNote, long? ShippingFeeRials, string? ShippingNote, int? PreparationMinutes, IReadOnlyList<OrderPaymentMethod> PaymentMethods, string? CardNumber, string? Sheba, string? CardHolderName, DepositPolicyKind DepositPolicy, decimal? DepositPercent, long? DepositFixedRials, int ReservationHoldHours, int PickupGraceHours, int RevisionReplyTimeoutHours, uint Version |
| `UpdateStorefrontSettingsRequest` | bool Enabled, bool AcceptingOrders, bool InStoreEnabled, bool PickupEnabled, bool LocalDeliveryEnabled, bool ShippingEnabled, long MinOrderRials, long? LocalDeliveryFeeRials, long? FreeDeliveryAboveRials, string? DeliveryAreaNote, long? ShippingFeeRials, string? ShippingNote, int? PreparationMinutes, IReadOnlyList<OrderPaymentMethod> PaymentMethods, string? CardNumber, string? Sheba, string? CardHolderName, DepositPolicyKind DepositPolicy, decimal? DepositPercent, long? DepositFixedRials, int ReservationHoldHours, int PickupGraceHours, int RevisionReplyTimeoutHours, uint Version |
| `StorefrontQrDto` | string PublicCode, string Url |
| `SlotTemplateDto` | Guid Id, FulfillmentMethod Method, DayOfWeek Day, TimeOnly Start, TimeOnly End, int Capacity, bool IsActive |
| `SlotTemplateInput` | FulfillmentMethod Method, DayOfWeek Day, TimeOnly Start, TimeOnly End, int Capacity |
| `ReplaceSlotTemplatesRequest` | IReadOnlyList<SlotTemplateInput> Templates |
| `FulfillmentSlotDto` | Guid Id, FulfillmentMethod Method, DateOnly Date, TimeOnly Start, TimeOnly End, DateTimeOffset StartsAt, DateTimeOffset EndsAt, int Capacity, int Booked, int Remaining, bool IsFull |
| `SlotQuery` | FulfillmentMethod Method, DateOnly? From, int Days = 7 |
| `ShopRefDto` | Guid StoreId, string Name, string PublicCode, bool AcceptingOrders |
| `ShopOpeningHoursDto` | DayOfWeek Day, TimeOnly? Opens, TimeOnly? Closes, bool Closed |
| `ShopMethodDto` | FulfillmentMethod Method, long? FeeRials, long? FreeAboveRials, string? Note, bool UsesSlots |
| `ShopCardTransferDto` | string CardNumber, string? Sheba, string? HolderName |
| `ShopInfoDto` | Guid StoreId, string Name, string? LogoUrl, string? Phone, string? Province, string? City, string? AddressLine, IReadOnlyList<ShopOpeningHoursDto> OpeningHours, bool AcceptingOrders, IReadOnlyList<ShopMethodDto> Methods, long MinOrderRials, IReadOnlyList<OrderPaymentMethod> PaymentMethods, ShopCardTransferDto? CardTransfer, DepositPolicyKind DepositPolicy, decimal? DepositPercent, long? DepositFixedRials, int? PreparationMinutes |
| `ShopCategoryDto` | Guid Id, string Name, int ProductCount |
| `ShopProductQuery` | string? Q, Guid? CategoryId, bool InStockOnly = false, string? Cursor = null, int Limit = 30 |
| `ShopUnitDto` | Guid StoreProductUnitId, string Name, decimal BaseQty, long? PriceRials |
| `ShopProductDto` | Guid StoreProductId, string Title, string? BrandName, Guid CategoryId, string? ImageUrl, bool InStock, int QuantityDecimals, IReadOnlyList<ShopUnitDto> Units |
| `ShopProductDetailDto` | Guid StoreProductId, string Title, string? BrandName, Guid CategoryId, string? CategoryName, string? Description, IReadOnlyList<string> ImageUrls, bool InStock, int QuantityDecimals, IReadOnlyList<ShopUnitDto> Units |
| `ShopCartLineDto` | Guid Id, Guid? StoreProductId, Guid StoreProductUnitId, string Title, string UnitName, decimal Quantity, long? UnitPriceRials, long? PriceWhenAddedRials, long LineTotalRials, bool AllowSubstitute, string? Note, IReadOnlyList<ShopCartIssue> Issues |
| `ShopCartDto` | Guid StoreId, IReadOnlyList<ShopCartLineDto> Lines, long SubtotalRials, int IssueCount, long MinOrderRials, bool MeetsMinimum, uint Version |
| `CartLineUpsert` | Guid StoreProductUnitId, decimal Quantity, bool AllowSubstitute, string? Note |
| `UpsertCartLinesRequest` | IReadOnlyList<CartLineUpsert> Lines |
| `CustomerAddressDto` | Guid Id, string? Title, string RecipientName, string Phone, string Province, string City, string AddressLine, string? Plaque, string? UnitNo, string? PostalCode, double? Latitude, double? Longitude, bool IsDefault, uint Version |
| `SaveCustomerAddressRequest` | string? Title, string RecipientName, string Phone, string Province, string City, string AddressLine, string? Plaque, string? UnitNo, string? PostalCode, double? Latitude, double? Longitude, bool IsDefault, uint? Version |

### Application services

- `IStorefrontSettingsService` — Seller: storefront settings, QR code, weekly slot templates and dated slots (F45, BIZ-ORD-03).
- `IStorefrontService` — Customer storefront browsing (anonymous): store info, categories, products, barcode lookup, slots (F45).
- `IShopCartService` — The logged-in customer's cart in one store; persistent but never a reservation (BIZ-ORD-01).
- `ICustomerOrdersService` — Customer side of orders: place (storefront), my orders across stores, revision answer, cancel, receipt, reorder.
- `ICustomerAddressService` — The customer's address book (per user, not per store).
- `IOrdersService` — Seller order desk (F46–F50): review, revise, confirm+reserve, prepare, hand over / ship, deliver+invoice, cancel.
- `IOrderPaymentsService` — Seller: order payments (review receipts, record cash/POS/cheque) and refund obligations (F48, BIZ-ORD-07).

## CustomerPortal

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `BankAccountRules` | `—` | — | `IsValidCardNumber`, `IsValidSheba`, `NormalizeCardNumber`, `NormalizeSheba`, `PassesIbanChecksum`, `PassesLuhn` |
| `SettlementReference` | `—` | — | `IsValid`, `Normalize` |
| `SettlementStateMachine` | `—` | — | `CanMove`, `IsActive`, `IsFinal`, `IsPending` |
| `CustomerSettlementRequest` | `portal.settlement_requests` | StoreScopedEntity, IAggregateRoot | `AbortApproval`, `Approve`, `BeginApproval`, `Cancel`, `Reject`, `Reply`, `RequestInfo`, `StartReview`, `Submit` |
| `CustomerSettlementEvent` | `portal.settlement_request_events` | — | — |
| `PortalErrors` | `—` | — | — |
| `PortalScope` | `—` | — | `Build`, `CanSeeInvoice`, `CustomerIn`, `OwnsRequest`, `TryGetCustomer`, `VisibleBalance` |
| `RecordClaim` | `portal.record_claims` | StoreScopedEntity, IAggregateRoot | `HidesFor`, `Open`, `Resolve` |
| `SettlementPlanner` | `—` | — | `Plan` |
| `SettlementStatusText` | `—` | — | — |
| `StorePortalSettings` | `portal.store_settings` | StoreScopedEntity, IAggregateRoot | `AcceptsSettlements`, `CreateDefault`, `ShowsAccount`, `Update` |

- **BankAccountRules** — Card number (16 digits + Luhn) and Sheba (IR + 24 digits + ISO 13616 mod-97 checksum) rules for the store's card-transfer destination. Input may contain Persian digits, spaces or dashes; stored values are normalized.
- **SettlementReference** — Card-transfer reference (پیگیری/مرجع) of a settlement receipt; normalized for per-store uniqueness (BIZ-BUY-06).
- **SettlementStateMachine** — Allowed transitions of a settlement request (BIZ-BUY-06): Submitted → UnderReview | NeedsInfo | Approved | Rejected | Cancelled; UnderReview → NeedsInfo | Approved | Rejected | Cancelled; NeedsInfo → UnderReview (customer reply) | Rejected | Cancelled. Approved, Rejected and Cancelled are final.
- **CustomerSettlementRequest** — portal.settlement_requests — a customer's card-transfer receipt sent from the customer panel. It is NOT a payment: the debt only decreases when a seller approves it, which records exactly one sales payment through IReceivablesService.SettleAsync (BIZ-BUY-06). The same reference or receipt file is never approved twice per store. Approval is two-step ( saved first, then the settlement, then ) because Sales opens its own transaction for the settlement.
- **CustomerSettlementEvent** — portal.settlement_request_events — independent timeline of a settlement request (BIZ-BUY-06).
- **PortalErrors** — Error codes specific to the customer portal (1.2).
- **PortalScope** — What the calling customer may see, resolved once per request. Pure logic (no database) so the ownership rules are unit-testable: the portal runs WITHOUT a current store, so every read is checked against this scope and anything outside it answers 404 — changing an id in the URL never opens another customer's document (BIZ-BUY-05).
- **RecordClaim** — portal.record_claims — "this record is not mine" (BIZ-BUY-01, BIZ-BUY-04). OTP proves control of the number today, not ownership of old documents (D15). While Open or Confirmed the customer record (whole store account) or the single invoice is hidden for the claiming user only; the store's documents and the real debt are never changed or deleted. Rejected shows the record again.
- **SettlementPlanner** — Where an approved customer receipt is applied (pure, unit-testable). The invoice the customer chose comes first, the rest follows the store's oldest-first order. Invoices the requesting customer reported as "not mine" are never paid with their money (BIZ-BUY-01). More than the payable debt is refused — no prepaid credit (BIZ-CRM-08).
- **SettlementStatusText** — Persian status words sent in the settlement-reviewed SMS (template tokens: [storeName, statusText]).
- **StorePortalSettings** — portal.store_settings — one row per store (created on first save; missing row = defaults). The store decides whether its customers see their account in the customer panel and may send settlement receipts, and where to transfer money.

### Owned types / domain records

- `CustomerRecordRef`(Guid StoreId, Guid CustomerId) — A crm.customers row registered by a store under the caller's verified mobile. Merged rows are excluded (their documents moved to the target); archived rows are INCLUDED — archiving never hides a real debt (BIZ-CRM-02).
- `ClaimVisibility`(Guid CustomerId, Guid? InvoiceId, RecordClaimStatus Status) — A claim of the caller that may hide a customer record (InvoiceId null) or one invoice.
- `OpenInvoiceBalance`(Guid InvoiceId, long OpenRials) — An open invoice of the customer (already in the store's allocation order: oldest due date, then date).
- `PlannedAllocation`(Guid InvoiceId, long AmountRials) — Amount of an approved receipt applied to one invoice.

### Enums

| Enum | Values |
|---|---|
| `SettlementRequestStatus` | Submitted · NeedsInfo · UnderReview · Approved · Rejected · Cancelled |
| `SettlementEventType` | Submitted · InfoRequested · Replied · ReviewStarted · Approved · Rejected · Cancelled |
| `PortalActor` | Customer · Seller |
| `RecordClaimStatus` | Open · Confirmed · Rejected |
| `RecordClaimTarget` | CustomerRecord · Invoice |
| `RecordClaimResolution` | Confirmed · Rejected |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `PortalStoreDto` | Guid StoreId, string StoreName, string? LogoUrl, long BalanceRials, DateTimeOffset? LastPurchaseAt, DateTimeOffset? LastPaymentAt, bool AcceptsSettlementRequests |
| `SettlementDestinationDto` | string? CardNumber, string? Sheba, string? HolderName |
| `PortalAccountDto` | Guid StoreId, string StoreName, string? LogoUrl, long BalanceRials, int OpenInvoiceCount, long PendingChequesRials, DateTimeOffset? LastPurchaseAt, DateTimeOffset? LastPaymentAt, IReadOnlyList<OpenInvoiceDto> OpenInvoices, long PendingSettlementRials, bool AcceptsSettlementRequests, SettlementDestinationDto? SettlementDestination |
| `PortalInvoiceQuery` | Guid? StoreId, DateOnly? From, DateOnly? To, bool OpenOnly = false, string? Cursor = null, int Limit = 30 |
| `PortalInvoiceSummaryDto` | Guid Id, Guid StoreId, string StoreName, long Number, DateTimeOffset IssuedAt, long TotalRials, long OpenRials, PaymentState PaymentState, InvoiceStatus Status |
| `PortalStatementQuery` | DateOnly From, DateOnly To |
| `CreateRecordClaimRequest` | Guid StoreId, RecordClaimTarget Target, Guid? InvoiceId, string Reason |
| `RecordClaimQuery` | RecordClaimStatus? Status, string? Cursor = null, int Limit = 30 |
| `RecordClaimDto` | Guid Id, Guid StoreId, string StoreName, RecordClaimTarget Target, Guid CustomerId, string? CustomerName, Guid? InvoiceId, long? InvoiceNumber, string ClaimantMobile, string Reason, RecordClaimStatus Status, DateTimeOffset CreatedAt, DateTimeOffset? ResolvedAt, string? ResolutionNote, uint Version |
| `ResolveRecordClaimRequest` | RecordClaimResolution Resolution, string? Note, uint Version |
| `SubmitCustomerSettlementForm` | Guid StoreId, long AmountRials, string Reference, DateTimeOffset PaidAt, Guid? InvoiceId, string? Note, IFormFile? Receipt |
| `ReplyCustomerSettlementForm` | string? Note, IFormFile? Receipt, uint Version |
| `CancelCustomerSettlementRequest` | string? Reason, uint Version |
| `CustomerSettlementQuery` | Guid? StoreId, SettlementRequestStatus? Status, string? Cursor = null, int Limit = 30 |
| `StoreSettlementRequestQuery` | SettlementRequestStatus? Status, Guid? CustomerId, string? Cursor = null, int Limit = 30 |
| `StartSettlementReviewRequest` | uint Version |
| `ApproveCustomerSettlementRequest` | string? Note, uint Version |
| `RejectCustomerSettlementRequest` | string Reason, uint Version |
| `RequestSettlementInfoRequest` | string Note, uint Version |
| `CustomerSettlementEventDto` | SettlementEventType Type, PortalActor Actor, DateTimeOffset OccurredAt, string? Note, string? FileUrl |
| `CustomerSettlementSummaryDto` | Guid Id, Guid StoreId, string StoreName, Guid CustomerId, string? CustomerName, long AmountRials, string Reference, DateTimeOffset PaidAt, SettlementRequestStatus Status, DateTimeOffset CreatedAt, DateTimeOffset? ReviewedAt |
| `CustomerSettlementDto` | Guid Id, Guid StoreId, string StoreName, Guid CustomerId, string? CustomerName, string CustomerMobile, long AmountRials, string Reference, DateTimeOffset PaidAt, Guid? InvoiceId, long? InvoiceNumber, string? Note, string? ReceiptUrl, SettlementRequestStatus Status, DateTimeOffset CreatedAt, DateTimeOffset? ReviewedAt, string? ReviewNote, IReadOnlyList<Guid> PaymentIds, IReadOnlyList<CustomerSettlementEventDto> Events, uint Version |
| `PortalSettingsDto` | Guid StoreId, bool ShowAccountToCustomers, bool AllowSettlementRequests, string? CardNumber, string? Sheba, string? CardHolderName, DateTimeOffset? UpdatedAt, uint Version |
| `UpdatePortalSettingsRequest` | bool ShowAccountToCustomers, bool AllowSettlementRequests, string? CardNumber, string? Sheba, string? CardHolderName, uint Version |

### Application services

- `ICustomerPortalService` — Customer panel reads (1.2, F79). Runs with NO current store: every query filters explicitly by the store id AND the caller's customer ids (crm.customers where mobile = verified mobile, not merged; archived rows still show their debt), minus records hidden by the caller's "not mine" claims and stores that switched the portal off. Anything outside the caller's scope answers 404 (BIZ-BUY-05).
- `ICustomerClaimsService` — "This record is not mine" (BIZ-BUY-01/04): hides the record for the caller only; store documents stay.
- `ICustomerSettlementsService` — Customer side of settlement requests (BIZ-BUY-06): a receipt is not a payment until the seller approves it.
- `IPortalSettingsService` — Seller: whether customers see their account and may send receipts, and the card-transfer destination.
- `ISettlementReviewService` — Seller review of settlement requests. Approve records exactly one sales payment via IReceivablesService.SettleAsync (which opens its own guarded transaction): the approval claim is saved first (optimistic concurrency), the settlement runs with the first approving call's Idempotency-Key, then the request is marked Approved. Retries, second clicks and second reviewers replay that one settlement and never reduce the debt twice (BIZ-BUY-06).
- `IClaimReviewService` — Seller review of "not mine" claims: Confirmed keeps the record hidden for that user; Rejected shows it again.

## Reporting

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `CalendarDay` | `reporting.calendar_days` | — | — |
| `DailySales` | `reporting.daily_sales` | — | `Apply` |
| `DailyProductSales` | `reporting.daily_product_sales` | — | `Apply` |
| `DailyReceipts` | `reporting.daily_receipts` | — | `Apply` |
| `DailyPurchases` | `reporting.daily_purchases` | — | `Apply` |
| `ProcessedEvent` | `reporting.processed_events` | — | — |
| `ActionItem` | `reporting.action_items` | StoreScopedEntity | `Dismiss`, `Open`, `Refresh`, `Resolve`, `Snooze` |
| `ExportJob` | `reporting.export_jobs` | StoreScopedEntity | `Complete`, `Expire`, `Fail`, `Queue`, `Start` |
| `ReportingErrors` | `—` | — | — |

- **CalendarDay** — reporting.calendar_days — seeded once; Jalali grouping (week starts Saturday) for every time filter.
- **DailySales** — reporting.daily_sales — one row per (store, day). Projection updated from outbox events (SaleCommitted, InvoiceCorrected). Profit only over CostKnownNet; UnknownCostNet drives the coverage percent (D17).
- **DailyProductSales** — reporting.daily_product_sales — best/slow sellers, stagnant stock, product profit.
- **DailyReceipts** — reporting.daily_receipts — cash-in by method, independent of sales day (F22 settlement report).
- **DailyPurchases** — reporting.daily_purchases — purchase vs sales.
- **ProcessedEvent** — reporting.processed_events — makes projections idempotent under at-least-once outbox delivery.
- **ActionItem** — reporting.action_items — Action Center (F59). One open item per (store, kind, ref); recomputed by the worker; resolved automatically when the underlying condition disappears.
- **ExportJob** — reporting.export_jobs — async Excel/CSV exports (F66); file kept in platform.files for a limited time.
- **ReportingErrors** — Error codes specific to the Reporting module (messages are Persian at the throw site).

### Enums

| Enum | Values |
|---|---|
| `ActionKind` | LowStock · OutOfStock · UnknownCost · NoPrice · OverdueDebt · ChequeDueSoon · ChequeDue · NearExpiry · DraftPurchase · FailedSms · ImportErrors · PendingOrder · PendingTransferReceipt · PendingSettlementRequest |
| `ActionStatus` | Open · Snoozed · Dismissed · Done |
| `ActionSeverity` | Info · Warning · Critical |
| `ExportKind` | Products · Stock · Invoices · Customers · Debtors · Purchases · Movements · FullBackup |
| `ExportFormat` | Xlsx · Csv |
| `ExportStatus` | Queued · Running · Ready · Failed · Expired |
| `PeriodPreset` | Today · Yesterday · ThisWeek · LastWeek · ThisMonth · LastMonth · Last7Days · Last30Days · Last90Days · ThisYear · Custom |
| `ReportGrouping` | Day · Week · Month |
| `ProductRankBy` | Revenue · Quantity · Profit · InvoiceCount |
| `DataIssueKind` | UnknownCost · NoPrice · NegativeMargin · MissingBarcode · DuplicateTitle · NoCategory · StaleCount |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `ReportQuery` | PeriodPreset Period = PeriodPreset.Today, DateOnly? From = null, DateOnly? To = null, ReportGrouping GroupBy = ReportGrouping.Day, bool Compare = false |
| `ResolvedPeriodDto` | DateOnly From, DateOnly To, string Label, DateOnly? CompareFrom, DateOnly? CompareTo |
| `DeltaDto` | long Current, long Previous, decimal? ChangePercent |
| `CoverageDto` | long CostKnownNetRials, long UnknownCostNetRials, decimal CoveragePercent, int UnknownCostProductCount |
| `SummaryDto` | ResolvedPeriodDto Period, DeltaDto NetSales, DeltaDto InvoiceCount, long AverageInvoiceRials, long ReceivedRials, long NewCreditRials, long GrossProfitRials, CoverageDto Coverage, long TotalReceivableRials, int LowStockCount, int OpenActionCount |
| `SeriesPointDto` | DateOnly From, DateOnly To, string Label, long NetRials, int InvoiceCount, long? ProfitRials |
| `SalesReportDto` | ResolvedPeriodDto Period, long GrossRials, long DiscountRials, long NetRials, long TaxRials, long ShippingRials, int InvoiceCount, long AverageInvoiceRials, long CashSalesRials, long CreditSalesRials, IReadOnlyList<SeriesPointDto> Series, IReadOnlyList<SeriesPointDto>? CompareSeries |
| `DailyCompareDto` | DateOnly Day, long NetRials, int InvoiceCount, DateOnly CompareDay, long CompareNetRials, int CompareInvoiceCount, IReadOnlyList<HourBucketDto> Hours |
| `HourBucketDto` | int Hour, long NetRials, long CompareNetRials |
| `ReceiptsByMethodDto` | string Method, long SaleRials, long SettlementRials, long ReversedRials, int Count |
| `ReceiptsReportDto` | ResolvedPeriodDto Period, long TotalRials, long FromSalesRials, long FromSettlementsRials, IReadOnlyList<ReceiptsByMethodDto> ByMethod, IReadOnlyList<SeriesPointDto> Series |
| `ProfitLineDto` | Guid StoreProductId, string Title, decimal QtyBase, string BaseUnit, long NetRials, long CostRials, long ProfitRials, decimal? MarginPercent, bool CostUnknown |
| `ProfitReportDto` | ResolvedPeriodDto Period, long NetRials, long CostRials, long GrossProfitRials, decimal? MarginPercent, long DiscountRials, CoverageDto Coverage, IReadOnlyList<SeriesPointDto> Series |
| `ProductPerformanceQuery` | PeriodPreset Period = PeriodPreset.Last30Days, DateOnly? From = null, DateOnly? To = null, ProductRankBy RankBy = ProductRankBy.Revenue, bool Ascending = false, Guid? CategoryId = null, int Limit = 20 |
| `ProductPerformanceDto` | ResolvedPeriodDto Period, IReadOnlyList<ProfitLineDto> Items |
| `CategoryShareDto` | Guid? CategoryId, string Title, long NetRials, decimal SharePercent, long? ProfitRials |
| `AnalysisDto` | ResolvedPeriodDto Period, IReadOnlyList<CategoryShareDto> ByCategory, IReadOnlyList<ProfitLineDto> TopSellers, IReadOnlyList<ProfitLineDto> SlowSellers, IReadOnlyList<StagnantItemDto> Stagnant, IReadOnlyList<WeekdayShareDto> ByWeekday |
| `StagnantItemDto` | Guid StoreProductId, string Title, decimal OnHand, long? StockValueRials, DateOnly? LastSoldDay, int DaysWithoutSale |
| `WeekdayShareDto` | int DayOfWeek, long NetRials, int InvoiceCount |
| `PurchaseVsSalesDto` | ResolvedPeriodDto Period, long PurchaseRials, long SalesNetRials, long SalesCostRials, IReadOnlyList<PurchaseVsSalesPointDto> Series |
| `PurchaseVsSalesPointDto` | DateOnly From, DateOnly To, string Label, long PurchaseRials, long SalesNetRials |
| `DiscountBySellerDto` | Guid MemberId, string Name, long DiscountRials, int InvoiceCount, long PriceOverrideRials |
| `DiscountsReportDto` | ResolvedPeriodDto Period, long LineDiscountRials, long InvoiceDiscountRials, long PriceOverrideRials, decimal DiscountPercentOfGross, IReadOnlyList<DiscountBySellerDto> BySeller, IReadOnlyList<ProfitLineDto> TopDiscountedProducts |
| `LowStockItemDto` | Guid StoreProductId, string Title, decimal OnHand, decimal Reserved, decimal Available, decimal Threshold, string BaseUnit, decimal? AvgDailySales, int? DaysOfCover, string? SupplierName |
| `StockHealthDto` | int ActiveProducts, int OutOfStock, int LowStock, int Stagnant, int NearExpiry, int UnknownCost, int NoPrice, long StockValueRials, CoverageDto ValueCoverage |
| `StockValueByCategoryDto` | Guid? CategoryId, string Title, long CostValueRials, long RetailValueRials, int ProductCount |
| `StockValueDto` | long CostValueRials, long RetailValueRials, long PotentialProfitRials, int UnknownCostProducts, IReadOnlyList<StockValueByCategoryDto> ByCategory |
| `DataIssueDto` | DataIssueKind Kind, int Count, string Title, string? Hint |
| `DataIssueItemDto` | Guid StoreProductId, string Title, DataIssueKind Kind, string? Detail |
| `ActionListQuery` | ActionStatus? Status = ActionStatus.Open, ActionKind? Kind = null, string? Cursor = null, int Limit = 30 |
| `ActionItemDto` | Guid Id, ActionKind Kind, ActionSeverity Severity, string RefType, Guid RefId, string Title, string? Detail, long? AmountRials, ActionStatus Status, DateTimeOffset? SnoozeUntil, DateTimeOffset CreatedAt |
| `ActionCountsDto` | int Open, int Critical, IReadOnlyDictionary<string, int> ByKind |
| `SnoozeActionRequest` | DateTimeOffset Until |
| `CreateExportRequest` | ExportKind Kind, ExportFormat Format, DateOnly? From, DateOnly? To, IReadOnlyDictionary<string, string>? Filters |
| `ExportJobDto` | Guid Id, ExportKind Kind, ExportFormat Format, ExportStatus Status, int? RowCount, string? DownloadUrl, DateTimeOffset CreatedAt, DateTimeOffset? ExpiresAt, string? Error |

### Application services

- `IReportsService` — Read-only reports over reporting.daily_* (Dapper, SUM by day range). Never reads OLTP tables per invoice.
- `IActionCenterService`
- `IExportsService`
- `IReportingProjector` — Worker-side: folds integration events into daily_* rows (idempotent via processed_events).

## Imports

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `ImportRun` | `imports.import_runs` | StoreScopedEntity, IAggregateRoot | `Cancel`, `Complete`, `Fail`, `Map`, `SetValidation`, `StartExecution`, `Upload` |
| `ImportRow` | `imports.import_rows` | — | `MarkError`, `MarkImported`, `MarkValid`, `Skip`, `UpdateRaw` |
| `ImportErrors` | `—` | — | — |

- **ImportRun** — imports.import_runs — one uploaded Excel/CSV file (F31, F70). Same file (sha256 fingerprint) cannot be executed twice for the same kind (BIZ-IMP-02). Execution is all-valid-rows-in-one-transaction, error rows go to an error file.
- **ImportRow** — imports.import_rows — raw values + parsed result + row-level error per row.
- **ImportErrors** — Error codes of the Excel import (UPPER_SNAKE; messages are Persian).

### Enums

| Enum | Values |
|---|---|
| `ImportKind` | Products · OpeningStock · PurchaseReceipt · Customers · PriceUpdate |
| `ImportStatus` | Uploaded · Mapped · Validated · Executing · Completed · CompletedWithErrors · Failed · Cancelled |
| `ImportRowStatus` | Pending · Valid · Warning · Error · Imported · Skipped |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `ImportTemplateColumnDto` | string Key, string Title, bool Required, string DataType, string? Example, string? Hint |
| `ImportTemplateDto` | ImportKind Kind, string Version, IReadOnlyList<ImportTemplateColumnDto> Columns, string DownloadUrl |
| `ImportUploadForm` | ImportKind Kind, IFormFile File |
| `DetectedSheetDto` | string Name, int RowCount, IReadOnlyList<string> Headers |
| `ColumnSuggestionDto` | string Header, string? SuggestedKey, decimal Confidence |
| `ImportRunDto` | Guid Id, ImportKind Kind, string FileName, ImportStatus Status, string? SheetName, int HeaderRow, IReadOnlyDictionary<string, string> ColumnMapping, Guid? SupplierId, int TotalRows, int ValidRows, int WarningRows, int ErrorRows, int ImportedRows, string? ErrorFileUrl, Guid? ResultPurchaseId, DateTimeOffset CreatedAt, DateTimeOffset? CompletedAt, IReadOnlyList<DetectedSheetDto> Sheets, IReadOnlyList<ColumnSuggestionDto> Suggestions, uint Version |
| `ImportMappingRequest` | string? SheetName, int HeaderRow, IReadOnlyDictionary<string, string> ColumnMapping, Guid? SupplierId, uint Version |
| `ImportRowDto` | Guid Id, int RowNo, ImportRowStatus Status, IReadOnlyDictionary<string, string?> Raw, string? ErrorCode, string? Message, string? Field, Guid? MatchedCatalogItemId, string? MatchedTitle |
| `ImportRowsQuery` | ImportRowStatus? Status, string? Cursor, int Limit = 50 |
| `ImportPreviewDto` | int TotalRows, int ValidRows, int WarningRows, int ErrorRows, int NewProducts, int ExistingProducts, long TotalCostRials, IReadOnlyList<ImportRowDto> Sample |
| `FixImportRowRequest` | IReadOnlyDictionary<string, string?> Values |
| `ExecuteImportRequest` | bool SkipErrorRows, uint Version |
| `ImportHistoryItemDto` | Guid Id, ImportKind Kind, string FileName, ImportStatus Status, int ImportedRows, int ErrorRows, DateTimeOffset CreatedAt |

### Application services

- `IImportsService` — Excel/CSV import (F31, F70, F71): template → upload → mapping → validate/preview → fix rows → execute. Execution reuses IPurchasingService.BulkRegister so imported rows follow the same rules as the wizard.

## Admin

### Entities

| Entity | Table | Base | Behaviour |
|---|---|---|---|
| `AdminErrors` | `—` | — | — |
| `SeedRun` | `admin.seed_runs` | Entity, IAggregateRoot | `MarkApplied`, `RecordRows`, `SetValidation`, `Upload` |
| `SeedRunRow` | `admin.seed_run_rows` | — | — |
| `AuditLogEntry` | `admin.audit_log` | — | — |

- **AdminErrors** — Admin-specific error codes.
- **SeedRun** — admin.seed_runs — one versioned seed package (catalog_seed_vX.Y.Z.json from Excel, see seed/README). Idempotent: re-applying the same version + checksum is a no-op; rows upsert by seed_key.
- **SeedRunRow** — admin.seed_run_rows — diff per seed_key (what the run inserted/updated/failed).
- **AuditLogEntry** — admin.audit_log — append-only record of sensitive actions (admin and store: price change, stock adjust, invoice correction, staff/permission change, merge, export). Written from outbox/domain events.

### Enums

| Enum | Values |
|---|---|
| `SeedRunStatus` | Uploaded · Validated · Applied · Failed · RolledBack |
| `SeedRunMode` | DryRun · Apply |
| `SeedRowAction` | Insert · Update · Unchanged · Error |

### DTOs (API contracts)

| DTO | Fields |
|---|---|
| `AdminDashboardDto` | int ActiveStores, int NewStores7d, int ActiveUsers7d, int PendingReviews, int OldestReviewAgeHours, int OpenSupportRequests, int CatalogItemsPublic, int CatalogItemsPrivate, long Invoices7d |
| `AdminStoreQuery` | string? Q, StoreStatus? Status, Guid? StoreTypeId, string? Cursor, int Limit = 50 |
| `AdminStoreSummaryDto` | Guid Id, string Name, string? StoreTypeName, StoreStatus Status, string OwnerMobile, int MemberCount, int ProductCount, DateTimeOffset CreatedAt, DateTimeOffset? LastActivityAt |
| `AdminStoreDto` | AdminStoreSummaryDto Summary, string? City, BusinessMode BusinessMode, IReadOnlyList<AdminMemberDto> Members, long Invoices30d, long Sales30dRials, int PrivateCatalogItems, int OpenCorrections |
| `AdminMemberDto` | Guid UserId, string Mobile, string? Name, MemberRole Role, MemberStatus Status |
| `ChangeStoreStatusRequest` | StoreStatus Status, string Reason |
| `AdminUserQuery` | string? Q, UserStatus? Status, string? Cursor, int Limit = 50 |
| `AdminUserDto` | Guid Id, string Mobile, string? DisplayName, UserStatus Status, IReadOnlyList<string> PlatformRoles, int StoreCount, DateTimeOffset CreatedAt, DateTimeOffset? LastLoginAt |
| `ChangeUserStatusRequest` | UserStatus Status, string Reason |
| `SetPlatformRolesRequest` | IReadOnlyList<string> Roles |
| `AdminSupportQuery` | SupportRequestStatus? Status, Guid? StoreId, string? Cursor, int Limit = 50 |
| `AdminSupportRequestDto` | Guid Id, Guid StoreId, string StoreName, string Subject, string Message, string? Context, SupportRequestStatus Status, DateTimeOffset CreatedAt, string? Reply |
| `ReplySupportRequest` | string Reply, SupportRequestStatus Status |
| `SeedUploadForm` | IFormFile File |
| `SeedRunDto` | Guid Id, string PackageVersion, string Checksum, SeedRunStatus Status, int Inserted, int Updated, int Unchanged, int Errors, IReadOnlyDictionary<string, int> CountsBySheet, DateTimeOffset CreatedAt, DateTimeOffset? AppliedAt |
| `SeedRunRowDto` | string Sheet, string SeedKey, SeedRowAction Action, string? ChangesJson, string? Error |
| `SeedRowsQuery` | SeedRowAction? Action, string? Sheet, string? Cursor, int Limit = 100 |
| `AuditQuery` | Guid? StoreId, Guid? ActorUserId, string? Action, string? EntityType, Guid? EntityId, DateOnly? From, DateOnly? To, string? Cursor, int Limit = 100 |
| `AuditLogEntryDto` | long Id, DateTimeOffset OccurredAt, Guid? StoreId, Guid? ActorUserId, string? ActorMobile, string Action, string EntityType, Guid? EntityId, string? DataJson |

### Application services

- `IAdminPlatformService`
- `ISeedService` — Seed package pipeline: upload JSON → validate (dry-run diff) → apply (upsert by seed_key, one transaction).
