import { describe, expect, it } from 'vitest';
import { parseBarcode } from './barcode';
describe('barcode contract parity', () => {
  it.each([' ۰۰۱۲۳۴۵۷ ', '00123457', 'AB-12_test.01', '00001'])('preserves canonical strings: %s', (code) => {
    expect(parseBarcode(code).ok).toBe(true);
  });
  it('preserves leading zeros after digit normalization', () => {
    expect(parseBarcode(' ۰۰۱۲۳۴۵۷ ')).toEqual({ ok: true, value: '00123457' });
  });
  it.each(['00123456', 'AB 12', 'AB/12', 'کالا۱۲۳۴', 'AB\u000012', '123', 'A'.repeat(33)])(
    'rejects malformed codes: %s',
    (code) => {
      expect(parseBarcode(code).ok).toBe(false);
    },
  );
});
