import type { Dto } from '@dukani/contracts';
import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { unitSchema } from './UnitForm.schema';

export type UnitFormMode = 'add' | 'edit';

/** What the unit form validates against besides its own values. */
export type UnitFormContext = {
  readonly mode: UnitFormMode;
  /** Decimals of the base unit: a count unit takes whole factors. */
  readonly maxDecimals: number;
  /** Normalized names of the product's other active units (the base unit included). */
  readonly takenNames: readonly string[];
};

type UnitSchema = ReturnType<typeof unitSchema>;
export type UnitAppForm = AppForm<InferInput<UnitSchema>, Infer<UnitSchema>>;

export type UnitFormProps = {
  product: Dto<'StoreProductDto'>;
  /** The unit being edited; absent when a new unit is added. */
  unit?: Dto<'StoreProductUnitDto'>;
  /** Back to the unit list (after a save, or a confirmed discard). */
  onDone: () => void;
};
