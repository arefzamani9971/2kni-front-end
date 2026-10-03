import { rules, s } from '@dukani/forms';

/** storeprofile «تماس و نشانی» (358:481): every field optional, but a filled value must be valid (F02 §6). */
export const contactSchema = s.object({
  phone: rules.optional.storePhone(),
  email: rules.optional.email().refine((v) => v === null || v.length <= 160, 'ایمیل حداکثر ۱۶۰ نویسه است.'),
  addressLine: rules.optionalText('نشانی', 400),
  postalCode: rules.optional.postalCode(),
});
