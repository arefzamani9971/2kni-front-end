/** Equality of filter values: primitives by value (`false`/`0` are values, not «empty»), arrays item by item. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((item, index) => Object.is(item, b[index]));
  return false;
}
