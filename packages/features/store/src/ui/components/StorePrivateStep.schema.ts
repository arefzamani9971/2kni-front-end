import { rules, s } from '@dukani/forms';

/** storelegal «اطلاعات مالک و بانکی» (358:482): optional, validated when filled (F02 §7). */
export const privateSchema = s.object({
  ownerName: rules.optionalText('نام مالک', 160),
  licenseNo: rules.optionalText('شناسه مجوز کسب', 64),
  nationalId: rules.optional.nationalId(),
  accountNumber: rules.optional.accountNumber(),
  cardNumber: rules.optional.cardNumber(),
  iban: rules.optional.sheba(),
});
