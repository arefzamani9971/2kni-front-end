import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());

// jsdom gaps used by real components: vaul drawers capture the pointer, UploadArea previews a picked file
if (typeof window !== 'undefined') {
  const el = window.HTMLElement.prototype;
  el.setPointerCapture ??= () => undefined;
  el.releasePointerCapture ??= () => undefined;
  el.hasPointerCapture ??= () => false;
  // Node's own createObjectURL rejects jsdom files
  URL.createObjectURL = () => 'blob:test';
  URL.revokeObjectURL = () => undefined;
  // Radix measures popper anchors and in-form checkbox inputs; layout does not exist in jsdom
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
