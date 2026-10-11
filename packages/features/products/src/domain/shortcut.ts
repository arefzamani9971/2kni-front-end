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

/** Moves one shortcut up or down by `offset`; out-of-range moves keep the list. */
export function moveShortcut(
  items: readonly ShortcutItem[],
  id: string,
  offset: number,
): readonly ShortcutItem[] {
  const index = items.findIndex((i) => i.storeProductId === id);
  const to = index + offset;
  if (index < 0 || to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[index], next[to]] = [next[to]!, next[index]!];
  return next;
}

/** Drag and drop: puts the dragged shortcut at the drop target's position. */
export function dropShortcut(
  items: readonly ShortcutItem[],
  fromId: string,
  toId: string,
): readonly ShortcutItem[] {
  const index = items.findIndex((i) => i.storeProductId === fromId);
  const to = items.findIndex((i) => i.storeProductId === toId);
  if (index < 0 || to < 0 || fromId === toId) return items;
  const next = [...items];
  next.splice(to, 0, next.splice(index, 1)[0]!);
  return next;
}

/** Error kinds after which the server certainly did not apply the save, so the frozen request is released. */
export const isDefinitiveShortcutFailure = (kind: unknown): boolean =>
  ['Validation', 'BusinessRule', 'Conflict', 'Permission', 'Unauthorized', 'NotFound'].includes(String(kind));
