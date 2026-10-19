import { decimal } from './decimal/decimal';
import { fitsBaseQuantity, toBaseQuantity } from './quantity';

const d = decimal.of;

describe('base quantity of a unit (F12 §7, §11)', () => {
  it('multiplies exactly, never through floats', () => {
    expect(toBaseQuantity(d(3), d(20))).toBe('60'); // 3 packs of 20 pens
    expect(toBaseQuantity(d(4), d('2.5'))).toBe('10'); // 4 bags of 2.5 kg
    expect(toBaseQuantity(d(3), d(1))).toBe('3'); // 3 indivisible boxes of 12 colours
    expect(toBaseQuantity(d('0.1'), d('0.2'))).toBe('0.02'); // 0.1 × 0.2 is not 0.020000000000000004
  });

  it('fits only within the base unit decimals and the line limit', () => {
    expect(fitsBaseQuantity(d(3), d(20), 0)).toBe(true);
    expect(fitsBaseQuantity(d('25.5'), d(1), 3)).toBe(true); // weighed: 25.5 kg
    expect(fitsBaseQuantity(d('25.5'), d(1), 0)).toBe(false); // a count good takes no fraction
    expect(fitsBaseQuantity(d('0.333'), d('2.5'), 3)).toBe(false); // 0.8325 kg is not rounded to 0.832
    expect(fitsBaseQuantity(d('0.4'), d('2.5'), 3)).toBe(true); // 1 kg
    expect(fitsBaseQuantity(d(1), d('1000000000'), 3)).toBe(true); // N
    expect(fitsBaseQuantity(d('1.001'), d('1000000000'), 3)).toBe(false); // N + 1
  });

  it('holds for every whole pack count and factor (property)', () => {
    for (let packs = 1; packs <= 40; packs++)
      for (const factor of ['1', '2.5', '12', '20', '0.125']) {
        const base = toBaseQuantity(d(packs), d(factor));
        expect(decimal.eq(decimal.div(base, d(factor), 6), d(packs))).toBe(true);
        expect(fitsBaseQuantity(d(packs), d(factor), 3)).toBe(true);
      }
  });
});
