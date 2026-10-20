import type { Dto } from '@dukani/contracts';
import { useLocalizedAppForm, useValidationRules } from '@dukani/forms';
import { initial } from '../../domain/purchase';
import { totalsSchema } from '../schemas/purchase-totals.schema';

export function useTotalsForm(purchase: Dto<'PurchaseDto'>) {
  const rules = useValidationRules();
  return useLocalizedAppForm({
    schema: totalsSchema(rules),
    defaultValues: {
      discountAmount: initial(purchase.discountAmount),
      shippingAmount: initial(purchase.shippingAmount),
      nonRecoverableTaxAmount: initial(purchase.nonRecoverableTaxAmount),
      invoiceTotal: '',
    },
  });
}
