# Dukani backend — implementation guide (read fully before writing code)

This solution is a .NET 10 modular monolith (ASP.NET Core Controllers + EF Core 10 / Npgsql + PostgreSQL 18).
Contracts (controllers, DTO records, service interfaces, entities, EF model) already exist. The job now is to
**implement every service interface, add validators, fill gaps, and keep everything compiling**.

> There is NO .NET SDK in the authoring environment. Code cannot be compiled here. Write C# as if a strict reviewer
> will compile it: correct `using`s, exact member names (read the files you call!), nullable-correct, EF-translatable
> LINQ, no invented APIs. When unsure about a library API, prefer the simplest well-known overload.

Business rules live in `/root/.claude/uploads/4f84892d-a327-53c1-8e4b-fc5e9a4fca16/`:
`business-rules-and-gap-resolutions.md` (BIZ-* rules), `flowcharts.md` (F-flows + acceptance), `state-transitions.md`,
`final-decisions.md`, `page-contracts.md`, `core-user-flows_1.md`, `reports-and-metrics.md`. Grep them for the flow ids
mentioned in the controller/entity doc comments (e.g. `F22`, `BIZ-CRM-06`) and implement the acceptance criteria.

## 1. Layout of a module

```
src/Modules/Dukani.Modules.X/
  Api/                 controllers (thin: route + permission + [Idempotent] + one call)
  Application/         I…Service interfaces and cross-module ports (records + interfaces)
  Application/Services/  internal sealed class …Service : I…Service   ← YOU WRITE THESE
  Application/Validation/ public sealed class …Validator : AbstractValidator<Request>  ← AND THESE
  Contracts/           DTO records (API shapes)
  Domain/              entities (private setters, behaviour methods, Guard.Against)
  Infrastructure/      XModel : IModuleModel (EF config, schema)
  XModule.cs           AddXModule(): registers model, services, validators, handlers, jobs
```

`XModule.AddXModule()` must register everything:

```csharp
services.AddSingleton<IModuleModel, XModel>();
services.AddScoped<IXService, XService>();
services.AddScoped<ISomePort, SomePortImpl>();          // ports other modules call
services.AddScoped<IOutboxHandler, SomeEventHandler>(); // if the module handles outbox events
services.AddScoped<IScheduledJob, SomeJob>();           // if the module has periodic work
services.AddValidatorsFromAssembly(typeof(XModule).Assembly, includeInternalTypes: true);
```
(`using FluentValidation;` gives `AddValidatorsFromAssembly`.) Keep the existing method name/signature of
`AddXModule` (Identity's is `AddIdentityModule(this IServiceCollection, IConfiguration)`).

## 2. Data access

* Inject `AppDbContext db` (namespace `Dukani.Platform.Persistence`) and use `db.Set<T>()`. No repositories.
* **Store filter:** every `StoreScopedEntity` has a global query filter on the current store (set by the
  `StoreAccessFilter` for seller routes, `StorefrontAccessFilter` for `/shop/{storeId}` routes). Still always write
  `.Where(x => x.StoreId == storeId)` for clarity on aggregates you load by id. Worker / admin / customer-portal code
  runs with **no** current store → the filter is off → you MUST filter by store/customer explicitly.
* Reads: `AsNoTracking()`; project to DTOs after materializing when mapping uses C# helpers.
* EF-translatable LINQ only inside queries (no custom methods, no `PersianText.*` inside `Where` — normalize the
  input first and compare to stored normalized columns). Text search: `EF.Functions.ILike(x.NormalizedTitle, QueryExtensions.ContainsPattern(q))`.
* Paging: `query.ToCursorPageAsync(cursor, limit, map, ct)` (entities, newest first) or
  `orderedQuery.ToOffsetPageAsync(cursor, limit, map, ct)` for other sorts (both in `Dukani.Platform.Persistence.QueryExtensions`).
* Optimistic concurrency: requests carrying `uint Version` → `db.CheckVersion(entity, request.Version)` before changing.
  `DbUpdateConcurrencyException` is mapped to 409 automatically.
* Cross-module **reads** may use another module's entities directly (`db.Set<StoreProduct>().AsNoTracking()`),
  if your project references that module. Cross-module **writes** go only through the ports listed in §6.
* Never call `db.Database.BeginTransactionAsync` inside work passed to `IOperationGuard` (it already opened one).
  For multi-step writes outside the guard use `await using var tx = await db.Database.BeginTransactionAsync(ct); … await tx.CommitAsync(ct);`
  Ports documented as "inside the caller's transaction" must not open or commit transactions.

## 3. Final (money/stock) commands — idempotency

Actions marked `[Idempotent]` pass `operationId`. Implement them with `IOperationGuard` (namespace `Dukani.Platform.Idempotency`):

```csharp
public Task<SaleResultDto> CommitAsync(Guid storeId, Guid operationId, CommitSaleRequest request, CancellationToken ct) =>
    guard.RunAsync(storeId, operationId, "sale.commit", request, async token =>
    {
        // … domain work, ports, outbox …
        await db.SaveChangesAsync(token);
        return (dto, invoice.Id);
    }, ct);
```

## 4. Errors & validation

* Throw with `Dukani.SharedKernel.Errors.Throw` (they RETURN the exception — always write `throw`):
  `?? throw Throw.NotFound("فاکتور")`, `throw Throw.Rule(ErrorCodes.StockNotEnough, "…")`, `throw Throw.Conflict(…)`,
  `throw Throw.Forbidden(ErrorCodes.PermissionDenied, "…")`, `throw Throw.Validation("field", "…")`, `throw Throw.VersionConflict()`.
  Mapping: Validation→400, Rule→422, NotFound→404, Conflict→409, Permission→403, Unauthorized→401.
* Error codes: use `ErrorCodes` constants; for codes specific to your module add a `public static class XErrors`
  in your module's `Domain` folder (do NOT edit SharedKernel/ErrorCodes.cs). Codes are UPPER_SNAKE, messages Persian.
* Domain invariants stay in entities (`Guard.Against(cond, code, msg)`). Add missing behaviour methods to your own
  entities rather than making setters public.
* **Validators (required for every request DTO bound from body or query):** FluentValidation
  `public sealed class XRequestValidator : AbstractValidator<XRequest>` in `Application/Validation/`. They run
  automatically (global `ValidationActionFilter`) → 400 `VALIDATION_FAILED` with camelCase field errors.
  Use the shared rules in `Dukani.Platform.Validation.RuleExtensions`: `.IranMobile()`, `.RequiredText(max,label)`,
  `.OptionalText(max,label)`, `.MoneyRials(label)`, `.PositiveQuantity()`, `.NonNegativeQuantity()`, `.PercentValue()`,
  `.BarcodeValue()`, `.RequiredId(label)`, `.PageLimit()`, `.ValidEnum(label)`, `.NotInFuture(label)`,
  `.AllowedFile(FileRule.Image|Document|Spreadsheet|Json)`. Nested collections: `RuleForEach(x => x.Lines).SetValidator(new LineValidator())`.
  All messages in Persian. Validators check shape/range only; rules needing the database belong in the service.

## 5. Shared services you can inject

| Service | Namespace | Use |
|---|---|---|
| `IClock` | `Dukani.SharedKernel.Primitives` | `UtcNow`, `BusinessDay(instant, tz)` |
| `ICurrentStore` | `Dukani.Platform.Context` | `StoreId`, `MemberId`, `TimeZoneId`, `IsOwner`, `Has(permission)`, `IsStorefront` |
| `ICurrentUser` | `Dukani.Platform.Context` | `UserId`, `Mobile`, `SessionId`, `IsPlatformAdmin` |
| `IOperationGuard` | `Dukani.Platform.Idempotency` | §3 |
| `IOutbox` | `Dukani.Platform.Outbox` | `Enqueue(new SaleCommitted(Guid.CreateVersion7(), clock.UtcNow, storeId, …))` — events in `Dukani.SharedKernel.Events` |
| `ISequenceGenerator` | `Dukani.Platform.Sequences` | `NextAsync(storeId, SequenceNames.Invoice, ct)` — call inside the transaction (you may add names in your module as constants) |
| `IFileStorage` | `Dukani.Platform.Files` | `SaveAsync(storeId, FileKind.X, name, contentType, stream, ct)` → `StoredFile` (row saved); `GetDownloadUrlAsync(id, TimeSpan, ct)`; `OpenReadAsync` |
| `ISmsSender` | `Dukani.Platform.Messaging` | `SendTemplateAsync(mobile, SmsTemplates.X, tokens, ct)` → `SmsSendResult` (never throws for provider errors) |
| `IReleaseGate` | `Dukani.Platform.Releases` | feature scope checks (controllers use `[RequiresRelease(ProductRelease.V3_0)]`) |
| `IOutboxHandler` | `Dukani.Platform.Outbox` | implement to react to events in the Worker; `message.Read<TEvent>()` |
| `IScheduledJob` | `Dukani.Platform.Jobs` | periodic worker job (Name, Interval, RunAsync) |

Value objects (`Dukani.SharedKernel.ValueObjects`): `Money` (long Rials; `Allocate`, `Multiply`), `Quantity`,
`IranMobile.Parse/TryParse(raw, out m, out err)`, `Barcode.Parse/TryParse`, `PersianText.NormalizeTitle/NormalizeDigits`,
`Percent`, `DateRange`, `Address`. Money is always `long` Rials in DTOs; quantities `decimal` in the item's base unit.

Time: store business day = `clock.BusinessDay(clock.UtcNow, currentStore.TimeZoneId)`; default zone `Asia/Tehran`.

## 6. Cross-module ports (the only way to WRITE into another module)

| Port | Owner (implements) | Methods |
|---|---|---|
| `IStockLedger` | Inventory | Receive, Issue, FindInsufficient, **Reserve / ReleaseReservation / ExtendReservation / ConsumeReservation** (orders) |
| `IStoreProductReader` | Inventory | sellable unit snapshots (price, availability, cost) |
| `ICustomerAccounts` | Customers | Get, ApplyBalanceDelta, **EnsureCustomer** (find-or-create by mobile) |
| `IOrderInvoicing` | Sales | delivered order → one invoice (+payments, reservation consumption) |
| `IReceivablesService.SettleAsync` | Sales | used by the customer portal when a seller approves a customer's settlement receipt |
| `ICatalogAdminService` | Catalog | used by Admin controllers |
| `IStoreAccessService` | Stores | membership + permissions for `StoreAccessFilter` |
| `IStorefrontAccessService` | Ordering | storefront open? for `StorefrontAccessFilter` |
| `ISessionValidator` | Identity | JWT pipeline rejects revoked sessions |

If you need something from another module that is not here, do the smallest safe thing inside your module (read-only
query) and **report it** in your final message instead of editing the other module.

## 7. Controllers

Keep existing routes and signatures (the frontend depends on them). You may add endpoints that the business flows need,
following the same one-line style, with XML `<summary>` docs, `[RequirePermission]`, `[Idempotent]` where money/stock
changes. Base classes: `StoreController` (seller, `api/v1/stores/{storeId:guid}/…`), `StorefrontController`
(`api/v1/shop/{storeId:guid}/…`, browsing actions `[AllowAnonymous]`), `CustomerController` (`api/v1/customer/…`),
`AdminController`, `DukaniController`. File uploads: `[Consumes("multipart/form-data")]` + a `[FromForm]` record containing `IFormFile File`.

## 8. Tests

Create `tests/Dukani.Modules.X.Tests/Dukani.Modules.X.Tests.csproj` (xunit; packages `Microsoft.NET.Test.Sdk`, `xunit`,
`xunit.runner.visualstudio` without versions — central versions exist; `<IsPackable>false</IsPackable>`; ProjectReference to your module)
with focused unit tests of domain rules and validators (no database). Cover the acceptance examples from the flow docs.

## 9. Before you finish

1. `python3 tools/openapi-gen/check_references.py` — must report 0 issues for files in your module.
2. `python3 tools/openapi-gen/gen_openapi.py` — no issues for your controllers (other agents work in parallel; ignore their transient issues).
3. Re-read every file you wrote once, specifically hunting for compile errors (missing usings, wrong property names,
   missing `await`, `Task` vs `Task<T>`, record positional order, nullable misuse, private setters written from outside).
4. Final message: list of files, endpoints added, ports implemented, anything you could not do, and any change you
   need in another module.

Do not edit: `Directory.Packages.props`, `Dukani.slnx`, `src/Dukani.SharedKernel/**`, `src/Dukani.Platform/**`,
`src/Dukani.Api/**`, `src/Dukani.Worker/**`, `tools/**`, or other modules (unless your brief says so).
