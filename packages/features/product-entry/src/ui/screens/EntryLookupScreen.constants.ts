import type { Dto } from '@dukani/contracts';

/** Translation key of the heading for each barcode lookup result. */
export const LOOKUP_COPY = {
  StoreProduct: 'lookup.local',
  GlobalCatalog: 'lookup.catalog',
  Multiple: 'lookup.multiple',
  Unknown: 'lookup.unknown',
  Conflict: 'lookup.conflict',
  Invalid: 'lookup.invalid',
} as const satisfies Record<Dto<'BarcodeLookupKind'>, string>;
