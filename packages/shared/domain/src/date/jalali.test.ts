import { describe, expect, it } from 'vitest';
import { formatJalali, fromDateOnly, jalaliMonthGrid, parseJalaliInput, resolvePeriod, toJalali } from './jalali';

describe('jalali', () => {
  it('converts and formats', () => {
    const d = new Date(2026, 8, 27);
    expect(toJalali(d)).toEqual({ year: 1405, month: 7, day: 5 });
    expect(formatJalali(d)).toBe('۱۴۰۵/۰۷/۰۵');
  });
  it('parses typed Jalali dates', () => {
    const r = parseJalaliInput('۱۴۰۵/۷/۵');
    expect(r.ok && r.value).toBe('2026-09-27');
    expect(parseJalaliInput('1405/12/31').ok).toBe(false);
    expect(parseJalaliInput('abc').ok).toBe(false);
  });
  it('builds a Saturday-first month grid', () => {
    const grid = jalaliMonthGrid(1405, 7);
    expect(grid).toHaveLength(6);
    expect(grid[0]![0]!.date.getDay()).toBe(6);
    expect(grid.flat().filter((c) => c.inMonth)).toHaveLength(30);
  });
  it('resolves week presets from Saturday', () => {
    const r = resolvePeriod('ThisWeek', new Date(2026, 8, 27));
    expect(fromDateOnly(r.from).getDay()).toBe(6);
    expect(r.to).toBe('2026-09-27');
  });
});
