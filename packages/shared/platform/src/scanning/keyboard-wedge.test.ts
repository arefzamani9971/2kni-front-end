import { describe, expect, it } from 'vitest';
import { createKeyboardWedgeDetector } from './keyboard-wedge';
import type { WedgeKey } from './keyboard-wedge.types';

const keys = (text: string, start: number, gap: number): WedgeKey[] =>
  [...text].map((char, i) => ({
    key: char,
    code: /[0-9]/.test(char) ? `Digit${char}` : /[a-z]/i.test(char) ? `Key${char.toUpperCase()}` : '',
    shiftKey: /[A-Z]/.test(char),
    timeStamp: start + i * gap,
  }));
const enter = (timeStamp: number): WedgeKey => ({ key: 'Enter', code: 'Enter', timeStamp });

describe('keyboard-wedge scanner detection', () => {
  it('returns the code of a fast burst ending in Enter and consumes the Enter', () => {
    const detector = createKeyboardWedgeDetector();
    const burst = keys('6261234567890', 1000, 8);
    burst.forEach((key) => expect(detector.feed(key)).toEqual({ code: null, consumed: false }));
    expect(detector.feed(enter(1000 + 13 * 8))).toEqual({ code: '6261234567890', consumed: true });
  });

  it('never takes human typing for a scan', () => {
    const detector = createKeyboardWedgeDetector();
    keys('12345678', 0, 120).forEach((key) => detector.feed(key));
    expect(detector.feed(enter(1000))).toEqual({ code: null, consumed: false });
  });

  it('reads physical keys, so a Persian keyboard layout does not change the code', () => {
    const detector = createKeyboardWedgeDetector();
    const persian: WedgeKey[] = [
      { key: '۴', code: 'Digit4', timeStamp: 0 },
      { key: 'ش', code: 'KeyA', timeStamp: 5, shiftKey: true },
      { key: 'ب', code: 'KeyF', timeStamp: 10 },
      { key: '-', code: 'Minus', timeStamp: 15 },
      { key: '۷', code: 'Digit7', timeStamp: 20 },
    ];
    persian.forEach((key) => detector.feed(key));
    expect(detector.feed(enter(25)).code).toBe('4Af-7');
  });

  it('starts over after a pause, ignores modifiers and short codes', () => {
    const detector = createKeyboardWedgeDetector();
    keys('99', 0, 5).forEach((key) => detector.feed(key));
    keys('12345', 500, 5).forEach((key) => detector.feed(key));
    expect(detector.feed(enter(525)).code).toBe('12345');
    keys('123', 1000, 5).forEach((key) => detector.feed(key));
    expect(detector.feed(enter(1015)).code).toBeNull();
    keys('1234', 2000, 5).forEach((key) => detector.feed(key));
    detector.feed({ key: 'v', code: 'KeyV', timeStamp: 2020, ctrlKey: true });
    expect(detector.feed(enter(2025)).code).toBeNull();
  });
});
