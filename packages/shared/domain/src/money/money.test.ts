import { describe, expect, it } from 'vitest';
import { decimal } from '../decimal/decimal';
import { previewPrice } from '../pricing';
import { toBaseQuantity, parseQuantity } from '../quantity';
import { fromApiMoney, toApiMoney } from './money-api';
import { formatMoney, money, moneyOps, parseMoneyInput } from './money';

describe('money', () => {
  it('formats with Persian digits and the single unit label (no conversion)', () => {
    expect(formatMoney(money(410000))).toBe('۴۱۰٬۰۰۰ تومان');
    expect(formatMoney(money('1250.5'), { unit: false })).toBe('۱٬۲۵۰٫۵');
  });
  it('reads API values as they are (BCR-01: no division)', () => {
    expect(fromApiMoney(410000)?.amount).toBe('410000');
    expect(toApiMoney(money(410000))).toBe(410000);
  });
  it('parses user input with Persian digits and separators', () => {
    const r = parseMoneyInput('۱۲٬۵۰۰');
    expect(r.ok && r.value.amount).toBe('12500');
    expect(parseMoneyInput('1e5').ok).toBe(false);
    expect(parseMoneyInput('-5').ok).toBe(false);
  });
  it('adds without float errors', () => {
    expect(moneyOps.add(money('0.1'), money('0.2')).amount).toBe('0.3');
  });
});

describe('pricing (F16)', () => {
  it('cost 80 + 25% markup = 100', () => {
    const p = previewPrice(money(80), { method: 'Markup', markupPercent: decimal.of(25) });
    expect(p.final?.amount).toBe('100');
  });
  it('rounds to a step and flags below-cost prices', () => {
    const p = previewPrice(money(1000), { method: 'Manual', manualPrice: money(950) });
    expect(p.isBelowCost).toBe(true);
    const r = previewPrice(money(1234), { method: 'FixedProfit', fixedProfit: money(100), roundingStep: money(100), roundingDirection: 'up' });
    expect(r.final?.amount).toBe('1400');
  });
  it('cost-based methods require a known cost', () => {
    expect(previewPrice(null, { method: 'Markup', markupPercent: decimal.of(10) }).requiresCost).toBe(true);
  });
});

describe('quantity (F12)', () => {
  it('3 packs of 20 = 60 base units', () => {
    expect(toBaseQuantity(decimal.of(3), decimal.of(20))).toBe('60');
  });
  it('count units reject decimals, weight units accept them', () => {
    expect(parseQuantity('1.5', 0).ok).toBe(false);
    expect(parseQuantity('۱٫۵', 3).ok).toBe(true);
    expect(parseQuantity('0', 3).ok).toBe(false);
  });
});
