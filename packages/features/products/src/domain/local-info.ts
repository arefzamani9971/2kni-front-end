import { decimal, normalizeTitle } from '@dukani/domain';
import type { LocalConflictField, LocalInfoRequest, LocalInfoValues, LocalProduct } from './local-info.types';

export const LOCAL_TITLE_MAX = 250;
export const LOCAL_NOTE_MAX = 1000;

const trimmedOrNull = (text: string) => (text.trim() === '' ? null : text.trim());

/** Form values of a product as it is now: the name field shows the effective name, as in Figma local (312:9574). */
export const localInfoValues = (p: LocalProduct): LocalInfoValues => ({
  localTitle: p.localTitle ?? p.catalogTitle,
  localNote: p.localNote ?? '',
  changeServiceCost: false,
  serviceCostAmount: p.serviceCostAmount ?? null,
});

/**
 * The `PUT …/local` body (F11 §5). It always carries the edited version, keeps the current shortcut (an empty one
 * would remove it) and sends a service cost only when the seller changed it on a service. A name that is empty or
 * only repeats the catalog name is sent as null, so the store keeps following the catalog name (F11 §4).
 */
export const toLocalRequest = (values: LocalInfoValues, p: LocalProduct): LocalInfoRequest => {
  const setServiceCost = p.kind === 'Service' && values.changeServiceCost;
  return {
    localTitle: repeatsCatalogTitle(values.localTitle, p.catalogTitle)
      ? null
      : trimmedOrNull(values.localTitle),
    localNote: trimmedOrNull(values.localNote),
    expectedVersion: p.version,
    shortcut: p.shortcut ?? null,
    setServiceCost,
    serviceCostAmount: setServiceCost ? values.serviceCostAmount : null,
  };
};

/** A local title equal to the catalog title after normalization adds nothing; clearing it is preferred (F11 §4). */
export const repeatsCatalogTitle = (localTitle: string, catalogTitle: string) =>
  localTitle.trim() !== '' && normalizeTitle(localTitle) === normalizeTitle(catalogTitle);

const sameAmount = (a: string | null | undefined, b: string | null | undefined) =>
  a == null || b == null ? a == null && b == null : decimal.eq(decimal.of(a), decimal.of(b));

/**
 * Whether the server already holds what this request asked for. After a lost response (unknown result) the product
 * is read again: if it matches, the save succeeded and must not be sent again with a stale version.
 */
export const localRequestApplied = (server: LocalProduct, request: LocalInfoRequest) =>
  (server.localTitle ?? null) === (request.localTitle ?? null) &&
  (server.localNote ?? null) === (request.localNote ?? null) &&
  (!request.setServiceCost || sameAmount(server.serviceCostAmount, request.serviceCostAmount));

/** Fields whose saved value differs from the form (a 409 shows them so the seller re-confirms, F11 §5). */
export const localConflicts = (fresh: LocalProduct, values: LocalInfoValues) => {
  const saved = localInfoValues(fresh);
  const fields: LocalConflictField[] = [];
  if ((trimmedOrNull(saved.localTitle) ?? '') !== (trimmedOrNull(values.localTitle) ?? ''))
    fields.push('localTitle');
  if ((trimmedOrNull(saved.localNote) ?? '') !== (trimmedOrNull(values.localNote) ?? ''))
    fields.push('localNote');
  if (values.changeServiceCost && !sameAmount(saved.serviceCostAmount, values.serviceCostAmount))
    fields.push('serviceCost');
  return fields;
};
