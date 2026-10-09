import { attentionItems, weekBars } from './home';

describe('home rules', () => {
  it('keeps only actionable kinds with a count', () => {
    expect(attentionItems({ LowStock: 3, UnknownCost: 2, FailedSms: 1, NoPrice: 0 })).toEqual([
      { kind: 'LowStock', count: 3 },
      { kind: 'UnknownCost', count: 2 },
    ]);
  });

  it('builds weekday bars in thousand toman', () => {
    // 2026-09-19 is a Saturday
    const bars = weekBars([
      { from: '2026-09-19', netAmount: '100000' },
      { from: '2026-09-20', netAmount: '150000' },
    ]);
    expect(bars.map((b) => [b.from, b.value, b.amount])).toEqual([
      ['2026-09-19', 100, '100'],
      ['2026-09-20', 150, '150'],
    ]);
  });
});
