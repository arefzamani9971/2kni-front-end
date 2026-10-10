import type { FieldError } from '@dukani/domain';

/**
 * Server-side wording of the mock backend. The real backend sends its own Persian ProblemDetails text; domain
 * validators only return code + reason, so the mock words them here the way the server would.
 */
const COPY: Readonly<Record<string, string>> = {
  'MOBILE_INVALID.empty': 'شماره موبایل را وارد کنید.',
  'MOBILE_INVALID.nonDigit': 'فقط رقم وارد کنید.',
  'MOBILE_INVALID.format': 'شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.',
  'BARCODE_INVALID.format': 'بارکد نامعتبر است.',
  'BARCODE_INVALID.checkDigit': 'رقم کنترل بارکد درست نیست.',
  'POSTAL_CODE_INVALID.postalCode': 'کد پستی باید ۱۰ رقم باشد.',
  'PHONE_INVALID.landline': 'شماره تلفن ثابت باید ۱۱ رقم و با پیش‌شماره باشد.',
  'PHONE_INVALID.storePhone': 'شماره تماس فقط رقم و بین ۵ تا ۲۰ رقم است.',
  'EMAIL_INVALID.email': 'نشانی ایمیل معتبر نیست.',
  'CARD_INVALID.cardFormat': 'شماره کارت باید ۱۶ رقم باشد.',
  'CARD_INVALID.cardChecksum': 'شماره کارت معتبر نیست.',
  'SHEBA_INVALID.shebaFormat': 'شماره شبا باید IR و ۲۴ رقم باشد.',
  'SHEBA_INVALID.shebaChecksum': 'شماره شبا معتبر نیست.',
  'ACCOUNT_NUMBER_INVALID.accountNumber': 'شماره حساب فقط رقم و حداکثر ۳۴ رقم است.',
  'NATIONAL_ID_INVALID.empty': 'کد ملی را وارد کنید.',
  'NATIONAL_ID_INVALID.format': 'کد ملی باید ۱۰ رقم باشد.',
  'NATIONAL_ID_INVALID.checksum': 'کد ملی معتبر نیست.',
  'LEGAL_ID_INVALID.legalFormat': 'شناسه ملی باید ۱۱ رقم باشد.',
  'LEGAL_ID_INVALID.legalChecksum': 'شناسه ملی معتبر نیست.',
};

export const serverMessage = (error: FieldError): string =>
  COPY[`${error.code}.${error.reason ?? ''}`] ?? 'مقدار واردشده معتبر نیست.';
