import { describe, expect, it } from 'vitest';
import { validPackagings } from './packagings';

describe('catalog packaging validation', () => {
  it('accepts fractional mass packages but enforces count-unit precision', () => {
    expect(validPackagings([{ name: 'بسته', baseQty: '۰٫۵' }], 3)).toBe(true);
    expect(validPackagings([{ name: 'بسته', baseQty: '0.5' }], 0)).toBe(false);
  });
  it('detects duplicate names after the same Persian normalization as the server', () => {
    expect(
      validPackagings(
        [
          { name: 'كيك ۱۲', baseQty: '1' },
          { name: ' کیک 12 ', baseQty: '2' },
        ],
        3,
      ),
    ).toBe(false);
  });
  it('enforces the catalog limit even when a unit allows greater precision', () => {
    expect(validPackagings([{ name: 'package', baseQty: '0.0001' }], 6)).toBe(false);
    expect(validPackagings([{ name: 'package', baseQty: '1000000000' }], 3)).toBe(true);
    for (const baseQty of ['0', '-1', '1000000001', 'invalid']) {
      expect(validPackagings([{ name: 'package', baseQty }], 3)).toBe(false);
    }
  });
  it('allows no packages and rejects excessive rows or empty names', () => {
    expect(validPackagings([], 3)).toBe(true);
    expect(validPackagings([{ name: ' ', baseQty: '1' }], 3)).toBe(false);
    expect(
      validPackagings(
        Array.from({ length: 11 }, (_, i) => ({ name: String(i), baseQty: '1' })),
        3,
      ),
    ).toBe(false);
  });
});
