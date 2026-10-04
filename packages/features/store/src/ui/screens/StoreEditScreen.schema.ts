import { rules, s } from '@dukani/forms';
import { contactSchema } from '../components/StoreContactStep.schema';

/** STORE-05 «ویرایش فروشگاه» (385:6912): name and type required; contact fields optional but valid (F03 §4). */
export const editSchema = s.object({
  name: rules.requiredText('نام فروشگاه', 160),
  storeTypeId: rules.required('نوع فروشگاه'),
  businessMode: s.enum(['Retail', 'Wholesale', 'Both']).nullable(),
  phone: contactSchema.shape.phone,
  email: contactSchema.shape.email,
  addressLine: contactSchema.shape.addressLine,
});
