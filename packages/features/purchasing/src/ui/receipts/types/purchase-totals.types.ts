import type { Dto } from '@dukani/contracts';
import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { totalsSchema } from '../schemas/purchase-totals.schema';

export type TotalsAmounts = Pick<
  Dto<'UpdatePurchaseDraftRequest'>,
  'discountAmount' | 'shippingAmount' | 'nonRecoverableTaxAmount'
>;
export type TotalsIntent = { amounts: TotalsAmounts; confirm: boolean; reason: string | null };
export type TotalsForm = AppForm<
  InferInput<ReturnType<typeof totalsSchema>>,
  Infer<ReturnType<typeof totalsSchema>>
>;
export type TotalsFieldsProps = { form: TotalsForm; disabled: boolean; computed?: Dto<'PurchaseTotalsDto'> };
