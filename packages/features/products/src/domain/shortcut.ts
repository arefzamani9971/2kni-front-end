import { normalizeDigits } from '@dukani/domain';
import type { ShortcutItem } from './shortcut.types';
export const normalizeShortcut = (value: string) => normalizeDigits(value.trim()).toUpperCase();
export const validShortcut = (value: string) => /^[\p{L}\p{N}_-]{1,16}$/u.test(normalizeShortcut(value));
export function canonicalShortcuts(items: readonly ShortcutItem[]): ShortcutItem[] {
  let order = 0;
  return items.map((item) => ({
    ...item,
    code: normalizeShortcut(item.code),
    sortOrder: item.showInQuickPick ? order++ : null,
  }));
}
export const sameShortcuts = (a: readonly ShortcutItem[], b: readonly ShortcutItem[]) => {
  const serialize = (items: readonly ShortcutItem[]) =>
    JSON.stringify(
      canonicalShortcuts(items)
        .sort((x, y) => x.storeProductId.localeCompare(y.storeProductId))
        .map(({ storeProductId, code, showInQuickPick, sortOrder }) => ({
          storeProductId,
          code,
          showInQuickPick,
          sortOrder,
        })),
    );
  return serialize(a) === serialize(b);
};
