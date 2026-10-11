import { describe, expect, it } from 'vitest';
import { acceptsFile, addFiles, removeFile } from './file-selection';

const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type });
const limits = { accept: 'image/*', maxFiles: 2, maxSizeMb: 1, images: true };

describe('file selection', () => {
  it('matches wildcard and exact accept entries', () => {
    expect(acceptsFile('image/*', file('a.png', 'image/png'))).toBe(true);
    expect(acceptsFile('application/pdf, image/png', file('a.pdf', 'application/pdf'))).toBe(true);
    expect(acceptsFile('image/*', file('a.pdf', 'application/pdf'))).toBe(false);
  });

  it('skips wrong type and size, stops at the limit and makes the first image primary', () => {
    const big = file('big.png', 'image/png', 2 * 1024 * 1024);
    const typed = addFiles([], [file('a.pdf', 'application/pdf'), big, file('a.png', 'image/png')], limits);
    expect(typed.error).toBe('size');
    expect(typed.next.map((f) => [f.file.name, f.primary])).toEqual([['a.png', true]]);
    const full = addFiles(typed.next, [file('b.png', 'image/png'), file('c.png', 'image/png')], limits);
    expect(full.error).toBe('maxFiles');
    expect(full.next).toHaveLength(2);
    expect(full.next[1]!.primary).toBe(false);
  });

  it('moves primary to the first remaining image when the primary is removed', () => {
    const { next } = addFiles([], [file('a.png', 'image/png'), file('b.png', 'image/png')], limits);
    expect(removeFile(next, next[0]!.id, true)).toEqual([{ ...next[1], primary: true }]);
  });
});
