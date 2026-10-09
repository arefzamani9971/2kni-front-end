import { describe, expect, it } from 'vitest';
import { parseDateOnly } from './parse-date-only';

describe('Gregorian DateOnly parser', () => {
  it('accepts real dates including century leap rules and early years', () => {
    for (const date of ['0001-01-01', '2000-02-29', '2024-02-29', '2026-12-31']) {
      expect(parseDateOnly(date)).toEqual({ ok: true, value: date });
    }
  });
  it('rejects rollover, zero dates, non-leap years and noncanonical input', () => {
    for (const date of [
      '0000-01-01',
      '1900-02-29',
      '2026-02-29',
      '2026-04-31',
      '2026-13-01',
      '2026-00-01',
      '2026-01-00',
      '2026-1-1',
      '2026-01-01T00:00:00Z',
      '۲۰۲۶-۰۱-۰۱',
    ]) {
      expect(parseDateOnly(date).ok).toBe(false);
    }
  });
});
