import { describe, expect, it } from 'vitest';
import { checkInputFilter } from './input-filter';
import { normalizeDigits, toPersianDigits } from './digits';
import { normalizeTitle } from './normalize';

describe('digits', () => {
  it('normalizes Persian and Arabic digits', () => {
    expect(normalizeDigits('۰۹۱۲ ٣٤٥')).toBe('0912 345');
    expect(toPersianDigits('1405/07/05')).toBe('۱۴۰۵/۰۷/۰۵');
  });
});

describe('checkInputFilter', () => {
  it.each([
    ['digits', '۰۹۱۲345', true],
    ['digits', '09a', false],
    ['decimal', '12.5', true],
    ['decimal', '۱۲٫۵', true],
    ['decimal', '1.2.3', false],
    ['persian-letters', 'علی رضایی', true],
    ['persian-letters', 'Ali', false],
    ['persian-letters', 'علی۱', false],
    ['persian', 'خودکار آبی ۲۰ تایی، مدل A', false],
    ['persian', 'خودکار آبی ۲۰ تایی، مدل الف', true],
    ['letters', 'Bic خودکار', true],
    ['letters', 'Bic2', false],
    ['latin', 'Bic A-100', true],
    ['latin', 'بیک', false],
    ['alphanumeric', 'مدل A100', true],
  ] as const)('%s accepts %j → %s', (filter, value, expected) => {
    expect(checkInputFilter(filter, value).accepted).toBe(expected);
  });
  it('supports custom patterns', () => {
    const f = { pattern: /^[A-Z0-9]*$/, message: 'فقط حروف بزرگ' };
    expect(checkInputFilter(f, 'P1')).toEqual({ accepted: true });
    expect(checkInputFilter(f, 'p1')).toEqual({ accepted: false, message: 'فقط حروف بزرگ' });
  });
});

describe('normalizeTitle', () => {
  it('matches the backend normalization', () => {
    expect(normalizeTitle('  خودكار   بيك‌آبی ۲ ')).toBe('خودکار بیک آبی 2');
  });
});
