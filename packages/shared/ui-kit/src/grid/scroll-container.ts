/** The nearest element that owns vertical scrolling; null means the document viewport. */
export function scrollContainer(node: Element): HTMLElement | null {
  let parent = node.parentElement;
  while (parent) {
    if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) return parent;
    parent = parent.parentElement;
  }
  return null;
}
