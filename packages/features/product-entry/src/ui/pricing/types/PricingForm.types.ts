import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { schema } from '../schemas/PricingForm.schema';

type PricingSchema = ReturnType<typeof schema>;
/** The pricing step form, shared by the step and its live preview leaves. */
export type PricingAppForm = AppForm<InferInput<PricingSchema>, Infer<PricingSchema>>;
