import { canonicalShortcuts, normalizeShortcut, sameShortcuts, validShortcut } from './shortcut';
import type { ShortcutItem } from './shortcut.types';
const item = (id: string, show = true): ShortcutItem => ({
  storeProductId: id,
  title: id,
  code: id.toUpperCase(),
  showInQuickPick: show,
  sortOrder: null,
  isEligible: true,
});
describe('shortcut intent', () => {
  it('canonicalizes digits and case without losing leading zeros', () => {
    expect(normalizeShortcut('  p۰۱ ')).toBe('P01');
    expect(validShortcut('پ۱')).toBe(true);
    expect(validShortcut('A B')).toBe(false);
    expect(validShortcut('a'.repeat(17))).toBe(false);
  });
  it('orders only visible shortcuts and detects changed intent on recovery', () => {
    const a = [item('a'), item('b', false), item('c')];
    expect(canonicalShortcuts(a).map((i) => i.sortOrder)).toEqual([0, null, 1]);
    expect(sameShortcuts(a, [{ ...a[0]!, title: 'renamed' }, a[1]!, a[2]!])).toBe(true);
    expect(sameShortcuts(a, [a[2]!, a[1]!, a[0]!])).toBe(false);
  });
});
