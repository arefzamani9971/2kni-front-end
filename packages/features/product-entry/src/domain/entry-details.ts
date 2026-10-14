import { decimal, parseDecimalInput } from '@dukani/domain';
import type { EntryDraft } from './entry-draft.types';
import type { DetailsCommit, NetContent } from './entry-details.types';

/** Net content is optional, but a value needs a positive amount (≤3 decimals) and a mass/volume/length unit. */
export function parseNetContent(raw: string, unitId: string, allowedUnitIds: readonly string[]): NetContent {
  if (!raw.trim())
    return unitId ? { ok: false, field: 'netContentValue' } : { ok: true, value: null, unitId: null };
  const parsed = parseDecimalInput(raw, { maxDecimals: 3 });
  if (!parsed.ok || !decimal.isPositive(parsed.value)) return { ok: false, field: 'netContentValue' };
  if (!allowedUnitIds.includes(unitId)) return { ok: false, field: 'netContentUnitId' };
  return { ok: true, value: parsed.value, unitId };
}

/** Writes the validated details step into the draft; services carry no barcode, packagings or service-less cost. */
export function applyDetails(draft: EntryDraft, commit: DetailsCommit): EntryDraft {
  const { values, productType, brand, brandStatus, attributes, netContent } = commit;
  const item = draft.newItem!;
  const service = item.kind === 'Service';
  const unit =
    productType.allowedUnits.find((u) => u.id === values.baseUnitId) ?? productType.defaultBaseUnit;
  return {
    ...draft,
    localTitle: values.localTitle,
    localNote: values.localNote,
    shortcut: values.shortcut,
    serviceCost: service ? values.serviceCost : null,
    newItem: {
      ...item,
      description: values.description,
      netContentValue: netContent.value,
      netContentUnitId: netContent.unitId,
      title: values.title,
      productTypeId: productType.id,
      productTypeName: productType.name,
      brandStatus,
      brandId: brand?.id ?? null,
      brandName: brand?.name ?? null,
      baseUnitId: unit.id,
      baseUnitName: unit.name,
      baseUnitMaxDecimals: unit.maxDecimals,
      baseBarcode: service ? '' : (values.barcode ?? ''),
      attributes,
      // first visit: suggest the type's default packagings on the units step
      packagings: service
        ? []
        : draft.intent === 'standalone'
          ? item.packagings
          : item.productTypeId === productType.id && item.packagings.length
            ? item.packagings
            : productType.defaultPackagings.map((p) => ({ name: p.name, baseQty: decimal.of(p.baseQty) })),
    },
  };
}

/** Switching goods ↔ service drops what the other kind cannot carry (stock, barcode, net content, packages). */
export function switchKind(draft: EntryDraft, kind: 'Goods' | 'Service'): EntryDraft {
  const item = draft.newItem!;
  return {
    ...draft,
    stock: null,
    stockDecided: kind === 'Service',
    lowStockThreshold: null,
    serviceCost: null,
    newItem: {
      ...item,
      kind,
      submitForPublicReview: kind === 'Service' ? false : item.submitForPublicReview,
      baseBarcode: '',
      netContentValue: null,
      netContentUnitId: null,
      packagings: [],
    },
  };
}
