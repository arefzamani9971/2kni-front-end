// Schema facade. `s` keeps the familiar zod syntax (`s.object({...})`); `rules` adds Dukani rules
// built on the pure parsers of @dukani/domain so the UI and the domain validate identically.
import {
  JALALI_INPUT_MESSAGES,
  MONEY_INPUT_MESSAGES,
  QUANTITY_MESSAGES,
  parseBarcode,
  parseCardNumber,
  parseDecimalInput,
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
  decimal,
  type DateOnly,
  type Money,
  type ValidationResult,
} from '@dukani/domain';
import { z } from 'zod';

export { z as s };
export type Infer<T extends z.ZodType> = z.output<T>;
export type InferInput<T extends z.ZodType> = z.input<T>;
export type Schema<TOut = unknown, TIn = unknown> = z.ZodType<TOut, TIn>;

const fromParser = <T>(parse: (raw: string) => ValidationResult<T>) =>
  z.string().transform((raw, ctx): T => {
    const r = parse(raw);
    if (!r.ok) {
      ctx.addIssue({ code: 'custom', message: r.error.message });
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
      ctx.addIssue({ code: 'custom', message: r.error.message });
      return z.NEVER;
    }
    return r.value;
  });

export const rules = {
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
  },
  requiredText: (label: string, max = 160) => fromParser((raw) => parseRequiredText(raw, label, max)),
  optionalText: (label: string, max = 500) =>
    z.string().transform((raw, ctx) => {
      const r = parseOptionalText(raw, label, max);
      if (!r.ok) {
        ctx.addIssue({ code: 'custom', message: r.error.message });
        return z.NEVER;
      }
      return r.value;
    }),
  /** Required selection (id of a picker/select). */
  required: (label: string) => z.string().min(1, `${label} را انتخاب کنید.`),
  money: (opts: { label?: string; allowZero?: boolean } = {}) =>
    z.string().transform((raw, ctx): Money => {
      const r = parseMoneyInput(raw);
      if (!r.ok) {
        ctx.addIssue({ code: 'custom', message: opts.label && r.error === 'empty' ? `${opts.label} را وارد کنید.` : MONEY_INPUT_MESSAGES[r.error] });
        return z.NEVER;
      }
      if (!opts.allowZero && decimal.isZero(r.value.amount)) {
        ctx.addIssue({ code: 'custom', message: 'مبلغ باید بیشتر از صفر باشد.' });
        return z.NEVER;
      }
      return r.value;
    }),
  optionalMoney: () =>
    z.string().transform((raw, ctx): Money | null => {
      if (raw.trim() === '') return null;
      const r = parseMoneyInput(raw);
      if (!r.ok) {
        ctx.addIssue({ code: 'custom', message: MONEY_INPUT_MESSAGES[r.error] });
        return z.NEVER;
      }
      return r.value;
    }),
  quantity: (maxDecimals = 0) =>
    z.string().transform((raw, ctx) => {
      const r = parseQuantity(raw, maxDecimals);
      if (!r.ok) {
        ctx.addIssue({ code: 'custom', message: QUANTITY_MESSAGES[r.error] });
        return z.NEVER;
      }
      return r.value;
    }),
  percent: () =>
    z.string().transform((raw, ctx) => {
      const r = parseDecimalInput(raw, { maxDecimals: 2 });
      if (!r.ok || decimal.gt(r.value, decimal.of(1000))) {
        ctx.addIssue({ code: 'custom', message: 'درصد را درست وارد کنید.' });
        return z.NEVER;
      }
      return r.value;
    }),
  /** DatePicker value (Gregorian DateOnly string). */
  date: (label = 'تاریخ') =>
    z.string().transform((raw, ctx): DateOnly => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        ctx.addIssue({ code: 'custom', message: raw ? JALALI_INPUT_MESSAGES.format : `${label} را انتخاب کنید.` });
        return z.NEVER;
      }
      return raw as DateOnly;
    }),
  optionalDate: () => z.string().transform((raw): DateOnly | null => (raw ? (raw as DateOnly) : null)),
};
