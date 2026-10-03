import { rules, s } from '@dukani/forms';

/** setup (312:8744): name and type are required, business mode is an explicit choice (F02 §5). */
export const schema = s.object({
  name: rules.requiredText('نام فروشگاه', 160),
  storeTypeId: rules.required('نوع فروشگاه'),
  businessMode: s.enum(['Retail', 'Wholesale', 'Both']),
});
