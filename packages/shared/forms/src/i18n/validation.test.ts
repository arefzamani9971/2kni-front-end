import { describe, expect, it } from 'vitest';
import { createCatalogTranslator } from '@dukani/i18n';
import { createRules } from '../schema';
import { formCatalogs } from './catalogs';

describe('localized validation', () => {
  it('translates parser errors while preserving canonical values', () => {
    const fa = createRules(createCatalogTranslator('fa', formCatalogs));
    const en = createRules(createCatalogTranslator('en', formCatalogs));
    const error = en.iranMobile().safeParse('0812');
    expect(error.success).toBe(false);
    if (!error.success) expect(error.error.issues[0]?.message).toMatch(/mobile/i);
    expect(en.iranMobile().parse('۰۹۱۲۳۴۵۶۷۸۹')).toBe(fa.iranMobile().parse('۰۹۱۲۳۴۵۶۷۸۹'));
    expect(en.money().parse('۱۲٬۵۰۰')).toEqual({ amount: '12500' });
    const required = en.requiredText('Product name').safeParse('');
    if (required.success) throw new Error('Expected required error');
    expect(required.error.issues[0]?.message).toBe('Enter Product name.');
  });
  it('translates optional and decimal validation without accepting invalid data', () => {
    const en = createRules(createCatalogTranslator('en', formCatalogs));
    expect(en.optional.email().parse('')).toBeNull();
    for (const result of [
      en.optional.email().safeParse('x@'),
      en.quantity(0).safeParse('1.5'),
      en.date().safeParse('bad'),
      en.optionalText('Note', 2).safeParse('long'),
    ]) {
      if (result.success) throw new Error('Expected validation error');
      expect(result.error.issues[0]?.message).not.toMatch(
        /[\u0621-\u063a\u0641-\u064a\u067e\u0686\u0698\u06a9\u06af\u06cc]/,
      );
    }
  });
});
