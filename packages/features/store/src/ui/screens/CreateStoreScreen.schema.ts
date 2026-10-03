import { rules, s } from '@dukani/forms';

export const schema = s.object({
  name: rules.requiredText('نام فروشگاه', 80),
  storeTypeId: rules.required('نوع فروشگاه'),
  businessMode: s.enum(['Retail', 'Wholesale', 'Both']),
});
