// Schema facade. `s` keeps the familiar zod syntax (`s.object({...})`); `rules` adds Dukani rules
// built on the pure parsers of @dukani/domain so the UI and the domain validate identically.
import {
  parseAccountNumber,
  parseBarcode,
  parseCardNumber,
  parseDecimalInput,
  parseDateOnly,
  parseEmail,
  parseIranMobile,
  parseLandline,
  parseLegalNationalId,
  parseMoneyInput,
  parseNationalId,
  parseOptionalText,
  parseOtpCode,
  parsePostalCode,
  parseQuantity,
  parseRequiredText,
  parseSheba,
  parseStorePhone,
  decimal,
  type DateOnly,
  type Money,
  type ValidationResult,
} from '@dukani/domain';
import { z } from 'zod';
import { createCatalogTranslator, DEFAULT_LOCALE } from '@dukani/i18n';
import { formCatalogs } from './i18n/catalogs';
import type { FormTranslator } from './i18n/types';

export { z as s };

export function createRules(t: FormTranslator) {
  const messageOf = (error: { code: string; reason?: string }) => {
    const key = ('codes.' + error.code + '.' + error.reason) as Parameters<FormTranslator>[0];
    return t.has(key) ? t(key) : t('invalid');
  };
  const fromParser = <T>(parse: (raw: string) => ValidationResult<T>, message = messageOf) =>
    z.string().transform((raw, ctx): T => {
      const r = parse(raw);
      if (!r.ok) {
        ctx.addIssue({ code: 'custom', message: message(r.error) });
        return z.NEVER;
      }
      return r.value;
    });

  /** Empty input → null, otherwise the given parser. */
  const optionalFrom = <T>(parse: (raw: string) => ValidationResult<T>) =>
    z.string().transform((raw, ctx): T | null => {
      if (raw.trim() === '') return null;
      const r = parse(raw);
      if (!r.ok) {
        ctx.addIssue({ code: 'custom', message: messageOf(r.error) });
        return z.NEVER;
      }
      return r.value;
    });

  return {
    iranMobile: () => fromParser(parseIranMobile),
    otp: () => fromParser(parseOtpCode),
    nationalId: () => fromParser(parseNationalId),
    legalNationalId: () => fromParser(parseLegalNationalId),
    sheba: () => fromParser(parseSheba),
    cardNumber: () => fromParser(parseCardNumber),
    postalCode: () => fromParser(parsePostalCode),
    landline: () => fromParser(parseLandline),
    email: () => fromParser(parseEmail),
    barcode: () => fromParser(parseBarcode),
    optional: {
      iranMobile: () => optionalFrom(parseIranMobile),
      nationalId: () => optionalFrom(parseNationalId),
      sheba: () => optionalFrom(parseSheba),
      cardNumber: () => optionalFrom(parseCardNumber),
      postalCode: () => optionalFrom(parsePostalCode),
      landline: () => optionalFrom(parseLandline),
      email: () => optionalFrom(parseEmail),
      barcode: () => optionalFrom(parseBarcode),
      storePhone: () => optionalFrom(parseStorePhone),
      accountNumber: () => optionalFrom(parseAccountNumber),
    },
    requiredText: (label: string, max = 160) =>
      fromParser(
        (raw) => parseRequiredText(raw, max),
        (error) => (error.code === 'REQUIRED' ? t('requiredText', { label }) : t('tooLong', { label, max })),
      ),
    optionalText: (label: string, max = 500) =>
      z.string().transform((raw, ctx) => {
        const r = parseOptionalText(raw, max);
        if (!r.ok) {
          ctx.addIssue({ code: 'custom', message: t('tooLong', { label, max }) });
          return z.NEVER;
        }
        return r.value;
      }),
    /** Required selection (id of a picker/select). */
    required: (label: string) => z.string().min(1, t('select', { label })),
    money: (opts: { label?: string; allowZero?: boolean } = {}) =>
      z.string().transform((raw, ctx): Money => {
        const r = parseMoneyInput(raw);
        if (!r.ok) {
          ctx.addIssue({
            code: 'custom',
            message:
              opts.label && r.error === 'empty'
                ? t('requiredText', { label: opts.label })
                : t(`money.${r.error}`),
          });
          return z.NEVER;
        }
        if (!opts.allowZero && decimal.isZero(r.value.amount)) {
          ctx.addIssue({ code: 'custom', message: t('moneyPositive') });
          return z.NEVER;
        }
        return r.value;
      }),
    optionalMoney: () =>
      z.string().transform((raw, ctx): Money | null => {
        if (raw.trim() === '') return null;
        const r = parseMoneyInput(raw);
        if (!r.ok) {
          ctx.addIssue({ code: 'custom', message: t(`money.${r.error}`) });
          return z.NEVER;
        }
        return r.value;
      }),
    quantity: (maxDecimals = 0) =>
      z.string().transform((raw, ctx) => {
        const r = parseQuantity(raw, maxDecimals);
        if (!r.ok) {
          ctx.addIssue({ code: 'custom', message: t(`quantity.${r.error}`) });
          return z.NEVER;
        }
        return r.value;
      }),
    percent: () =>
      z.string().transform((raw, ctx) => {
        const r = parseDecimalInput(raw, { maxDecimals: 2 });
        if (!r.ok || decimal.gt(r.value, decimal.of(1000))) {
          ctx.addIssue({ code: 'custom', message: t('percent') });
          return z.NEVER;
        }
        return r.value;
      }),
    /** DatePicker value (Gregorian DateOnly string). */
    date: (label = t('dateLabel')) =>
      z.string().transform((raw, ctx): DateOnly => {
        const result = parseDateOnly(raw);
        if (!result.ok) {
          ctx.addIssue({
            code: 'custom',
            message: raw ? t('dateFormat') : t('select', { label }),
          });
          return z.NEVER;
        }
        return result.value;
      }),
    optionalDate: () =>
      z.string().transform((raw, ctx): DateOnly | null => {
        if (raw === '') return null;
        const result = parseDateOnly(raw);
        if (result.ok) return result.value;
        ctx.addIssue({ code: 'custom', message: t('dateFormat') });
        return z.NEVER;
      }),
  };
}
export const rules = createRules(createCatalogTranslator(DEFAULT_LOCALE, formCatalogs));
