# Dukani frontend — guide for Claude

Dukani (دکانی) is store management for small Iranian shops: seller app, customer app, landing page, and later an admin panel. UI is Persian, RTL. **Reply to the user in Persian.**

## Read before working (the docs are the source of truth, don't ask the user to resend them)

1. `docs/README.md`: reading order, conflict priority, Figma page table
2. `docs/architecture/frontend-architecture.md`: modules, routes, backend contract, design system (§3)
3. `docs/architecture/responsive-components.md`: mobile ↔ desktop rules (required before touching ui-kit)
4. `docs/business/orders-services-membership.md`: newest business rules (2.5.0)
5. `docs/backend/change-requests.md`: backend gaps (BCR-xx), which stay hidden behind adapters
6. `docs/source-bundle/`: the owner's full business doc bundle (42 docs, verbatim, read-only; start at `START-HERE.md`). It covers product, releases v1.0–v4.0, domain rules, core flows, state transitions, page-contracts, ui/ux-guidelines, epics, sprint tasks, final decisions, and pending changes. Search it with Grep instead of reading it all; `page-contracts.md` and `core-user-flows.md` are large. **Its `02-architecture/` is context only:** backend architecture truth is `docs/reference/backend/`, and frontend architecture truth is `docs/architecture/frontend-architecture.md`.
7. `docs/backend/openapi.json`: current HTTP contract and generated-client input. `docs/reference/backend/*`: read-only historical API/domain snapshot; `docs/reference/product/*` is an older, adapted copy of some design docs (for ui/ux-guidelines, the bundle is newer)
8. `docs/architecture/responsive-proposal.md`: the owner's original mobile/desktop proposal
9. `../documents/frontend/developer-guide.md`: **how to build** a list/grid, filter, form, edit, delete, modal, scan area or chart with the shared infrastructure (`DataGrid` + `useAppList`, `FilterArea` + `useFilterDraft`, `useAppForm` + `FormActions`, `useConfirmAction`, `ScanArea` + `useScanIntake`, `ChartFrame`), and the performance checklist. Rules behind it: `../documents/spec/patterns/README.md`. What is implemented, a target rule or still remaining (and which screens still use old patterns): `../documents/spec/patterns/implementation-status.md`.

Conflict priority: current backend contract `docs/backend/openapi.json` (API/DTO/enum/errors), with `docs/reference/backend/` for historical domain context > newer business doc > Figma (visuals only).

## Figma

File `UYer2tdXokR61KYthMtPfb`. MVP pages: 00 `13:2`, 02 `19:2`, 03, 16 `306:3278`, 17 `306:9365` (seller mobile), 18 `307:425` (admin), 20 `310:2` (customer desktop), 20b `310:378` (customer mobile). Full table in `docs/README.md`.

Known Figma inconsistencies (keep the current code choice until the designer decides):

- The desktop destructive confirm uses the brand color. Code uses Danger.

## Stack & commands

Nx + pnpm monorepo. pnpm is not on PATH, so use `corepack pnpm`. Python is not installed; use node for scripts.
Next.js App Router, TS strict, Tailwind v4 CSS-first, Radix (`radix-ui`), vaul, cva, lucide, Storybook 10 (react-vite), Vitest + RTL.

```
corepack pnpm --filter <pkg> typecheck | lint | test
corepack pnpm -r --no-bail run typecheck   # everything (also lint / test)
corepack pnpm storybook          # ui-kit stories
```

`corepack pnpm check` (Nx run-many) fails on this machine because Nx spawns a bare `pnpm` that isn't on PATH, so use `pnpm -r` as shown above (or run `corepack enable` once). Lint prints "no cached ProjectGraph" Nx warnings. They are environmental; judge lint by its exit code.

## Layout

- `apps/{seller,customer,landing}`: thin; composition lives in `src/composition` (providers, container, gates)
- `packages/features/*`: auth, store, products, product-entry, purchasing, reports, marketing. Each feature sees only its own module plus shared ports.
- `packages/shared/*`: design-tokens, ui-kit, contracts (generated from openapi), data, http, platform, routes, domain, forms, app-core, testing

## Design system rules

- Token chain: primitive → semantic `--dukani-*` → Tailwind utility. Features never use raw colors or sizes.
- Themes: `data-theme="shop|customer|admin"` on `<html>`. Font: IRANSansX with Persian digits.
- Mobile/desktop: **Level 1** size/spacing differences use the `desktop:` variant plus density tokens (`h-control-adaptive` 48/40, `p-layout` 16/24, `w-sidebar` 240), with no JS. **Level 2** DOM/interaction differences use `createAdaptive` strategies (`Overlay`, `PickerPanel`/`SelectField`, `Screen` sidebar). Strategies share identical props and are stateless. Name components by the plain concept, with no Responsive/Smart prefix. Features do not choose components by viewport.
- File structure: one component / hook per file, no types or constants beside a component (`X.types.ts`, `X.constants.ts`, `domain/`), `.tsx` ≤ 250 and `.ts` ≤ 300 lines; split by responsibility (not per operation: one entity's CRUD stays in one hook / one file) and follow SOLID. Enforced by `architecture/file-structure` in `pnpm architecture:check`; old violations live only in `tools/architecture/structure-debt.json`, which may only shrink (details: frontend-architecture §2 «قاعدهٔ تفکیک فایل»).
- Every ui-kit component needs a story (plus the Figma node in its doc comment) and an a11y test.

## Working agreements

- Commit only when the user asks.
- Ask before deleting files. If a file is clearly an orphan, show the evidence (no imports, exports duplicated elsewhere) first.

## Next up (as of 2026-10-16)

Built 2026-10-15 (shared infrastructure, see the developer guide): `DataGrid` (Responsive Record List: table + pager / cards + infinite scroll, selection, sort), `Pager`, `FilterArea` (Filter Drawer), `FormActions`, `useConfirmAction`, `ScanArea` + `useScanIntake`, `ChartFrame`. US-F10-02 is the first migrated slice (paged `POST …/candidates` with `sortModel`, a draft-backed `SelectionStore` adapter). The other implemented backlogs migrate one stage at a time (F01 → F11, then a final US-F10-02 review); progress lives in the status register above. Still to build: Status Chip, Key Value Row and the rest of `responsive-components.md` §8.
