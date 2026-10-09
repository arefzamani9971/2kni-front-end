import { describe, expect, it } from 'vitest';
import { formatDecimalString } from './format-decimal';

describe('exact localized decimals', () => {
  it('preserves amounts larger than Number.MAX_SAFE_INTEGER and fraction trailing zeros', () => {
    expect(formatDecimalString('12345678901234567890.0010', 'en')).toBe('12,345,678,901,234,567,890.0010');
    expect(formatDecimalString('12345678901234567890.0010', 'fa')).toBe('۱۲٬۳۴۵٬۶۷۸٬۹۰۱٬۲۳۴٬۵۶۷٬۸۹۰٫۰۰۱۰');
    expect(formatDecimalString('-0.50', 'en')).toBe('-0.50');
  });
  it('rejects non-canonical input instead of silently rounding or parsing it', () => {
    expect(() => formatDecimalString('1e10', 'en')).toThrow(TypeError);
    expect(() => formatDecimalString('1,000', 'en')).toThrow(TypeError);
  });
});
