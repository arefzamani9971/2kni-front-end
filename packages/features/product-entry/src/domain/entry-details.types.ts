import type { DecimalString } from '@dukani/domain';
import type { AttributeValue, EntryDraft, NewItem } from './entry-draft.types';

/** Validated values of the details form (schema output), independent of the form library. */
export type DetailsValues = {
  readonly title: string;
  readonly baseUnitId: string;
  readonly barcode?: string | null;
  readonly description: string;
  readonly localTitle: string;
  readonly localNote: string;
  readonly shortcut: string;
  readonly serviceCost: EntryDraft['serviceCost'];
};

/** The parts of the selected product type the details step relies on. */
export type DetailsProductType = {
  readonly id: string;
  readonly name: string;
  readonly defaultBaseUnit: DetailsUnit;
  readonly allowedUnits: readonly DetailsUnit[];
  readonly defaultPackagings: readonly { readonly name: string; readonly baseQty: string | number }[];
};
export type DetailsUnit = { readonly id: string; readonly name: string; readonly maxDecimals: number };

export type NetContent =
  | { readonly ok: true; readonly value: DecimalString | null; readonly unitId: string | null }
  | { readonly ok: false; readonly field: 'netContentValue' | 'netContentUnitId' };

export type DetailsCommit = {
  readonly values: DetailsValues;
  readonly productType: DetailsProductType;
  readonly brand: { readonly id: string; readonly name: string } | null;
  readonly brandStatus: NewItem['brandStatus'];
  readonly attributes: readonly AttributeValue[];
  readonly netContent: Extract<NetContent, { ok: true }>;
};
