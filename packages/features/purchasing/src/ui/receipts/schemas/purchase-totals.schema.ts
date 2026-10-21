import { s, type ValidationRules } from '@dukani/forms';
import { decimal, toApiMoney } from '@dukani/domain';

export const totalsSchema = (rules: ValidationRules) => {
  const amount = () => rules.optionalMoney().transform((value) => (value ? toApiMoney(value) : decimal.zero));
  return s.object({
    discountAmount: amount(),
    shippingAmount: amount(),
    nonRecoverableTaxAmount: amount(),
    // Check-only input never blocks finalization or enters the saved request.
    invoiceTotal: s.string(),
  });
};
