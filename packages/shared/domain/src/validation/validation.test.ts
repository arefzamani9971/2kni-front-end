import { describe, expect, it } from 'vitest';
import {
  isValidCardNumber,
  isValidLegalNationalId,
  isValidNationalId,
  isValidSheba,
  parseBarcode,
  parseIranMobile,
  parseLandline,
  parseOtpCode,
  parsePostalCode,
  parseSheba,
} from './index';

describe('parseIranMobile (ui-guidelines 2.4.1 acceptance table)', () => {
  it.each(['09123456789', '۰۹۱۲۳۴۵۶۷۸۹', '٠٩١٢٣٤٥٦٧٨٩', '+98 912 345 6789', '00989123456789', '0912-345-6789'])(
    'accepts %s as 09123456789',
    (raw) => {
      const r = parseIranMobile(raw);
      expect(r.ok && r.value).toBe('09123456789');
    },
  );
  it.each([
    ['', 'شماره موبایل را وارد کنید.'],
    ['08123456789', 'شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.'],
    ['0912345678', 'شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.'],
    ['091234567890', 'شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.'],
    ['0912abc456789', 'فقط رقم وارد کنید.'],
  ])('rejects %j', (raw, message) => {
    const r = parseIranMobile(raw);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toBe(message);
  });
});

describe('parseOtpCode', () => {
  it.each(['012345', '۰۱۲۳۴۵', ' 012345 '])('accepts %j and keeps the leading zero', (raw) => {
    const r = parseOtpCode(raw);
    expect(r.ok && r.value).toBe('012345');
  });
  it.each(['123', '1234567', '12a345', '1e5', '-12345', '12 345'])('rejects %j', (raw) => {
    expect(parseOtpCode(raw).ok).toBe(false);
  });
});

describe('national ids', () => {
  it('validates personal national ids', () => {
    expect(isValidNationalId('0499370899')).toBe(true);
    expect(isValidNationalId('۰۴۹۹۳۷۰۸۹۹')).toBe(true);
    expect(isValidNationalId('0499370898')).toBe(false);
    expect(isValidNationalId('1111111111')).toBe(false);
    expect(isValidNationalId('049937089')).toBe(false);
  });
  it('validates legal-entity national ids', () => {
    expect(isValidLegalNationalId('10380284790')).toBe(true);
    expect(isValidLegalNationalId('10380284791')).toBe(false);
  });
});

describe('bank formats', () => {
  it('checks card numbers with Luhn', () => {
    expect(isValidCardNumber('6037 9975 9920 1236')).toBe(false);
    expect(isValidCardNumber('4111111111111111')).toBe(true);
    expect(isValidCardNumber('۴۱۱۱-۱۱۱۱-۱۱۱۱-۱۱۱۱')).toBe(true);
  });
  it('checks sheba with mod 97 and adds the IR prefix', () => {
    expect(isValidSheba('IR062960000000100324200001')).toBe(true);
    expect(isValidSheba('062960000000100324200001')).toBe(true);
    expect(isValidSheba('IR062960000000100324200002')).toBe(false);
    const r = parseSheba('ir06 2960 0000 0010 0324 2000 01');
    expect(r.ok && r.value).toBe('IR062960000000100324200001');
  });
});

describe('contact and barcode', () => {
  it('postal code is exactly 10 digits', () => {
    expect(parsePostalCode('۱۴۳۴۸۶۳۱۱۱').ok).toBe(true);
    expect(parsePostalCode('12345').ok).toBe(false);
  });
  it('landline needs the area code and is not a mobile', () => {
    expect(parseLandline('02112345678').ok).toBe(true);
    expect(parseLandline('09123456789').ok).toBe(false);
  });
  it('barcode keeps leading zeros and checks GS1 check digits', () => {
    const ok = parseBarcode('0012345678905');
    expect(ok.ok && ok.value).toBe('0012345678905');
    expect(parseBarcode('0012345678904').ok).toBe(false);
    expect(parseBarcode('P1').ok).toBe(false);
    expect(parseBarcode('12 34').ok).toBe(false);
    expect(parseBarcode('AB-1001').ok).toBe(true);
  });
});
