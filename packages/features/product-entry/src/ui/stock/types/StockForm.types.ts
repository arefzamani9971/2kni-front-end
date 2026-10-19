import type { Dto } from '@dukani/contracts';
import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { schemaFor } from '../schemas/StockForm.schema';

export type Kind = Dto<'PurchaseKind'>;

type StockSchema = ReturnType<typeof schemaFor>;
/** The stock step form, shared by the step and its live conversion leaf. */
export type StockAppForm = AppForm<InferInput<StockSchema>, Infer<StockSchema>>;
