import { attentionItems, weekBars } from './home';

describe('home rules', () => {
  it('keeps only actionable kinds with a count', () => {
    expect(attentionItems({ LowStock: 3, UnknownCost: 2, FailedSms: 1, NoPrice: 0 })).toEqual([
      { kind: 'LowStock', count: 3, label: '۳ کالا نزدیک اتمام' },
      { kind: 'UnknownCost', count: 2, label: '۲ کالا با بهای نامعلوم' },
    ]);
  });

  it('builds weekday bars in thousand toman', () => {
    // 2026-09-19 is a Saturday
    const bars = weekBars([{ from: '2026-09-19', netRials: 100_000 }, { from: '2026-09-20', netRials: 150_000 }]);
    expect(bars.map((b) => [b.label, b.display])).toEqual([
      ['شنبه', '۱۰۰'],
      ['یک‌شنبه', '۱۵۰'],
    ]);
  });
});
