import type { Dto } from '@dukani/contracts';

/** One unit command of the units scene; the body carries the product version it was made from. */
export type UnitCommand =
  | { readonly kind: 'add'; readonly body: Dto<'AddStoreUnitRequest'> }
  | { readonly kind: 'update'; readonly unitId: string; readonly body: Dto<'UpdateStoreUnitRequest'> };
