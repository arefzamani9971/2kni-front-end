import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchTerm } from './use-search-term';

describe('useSearchTerm (autocomplete policy)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const typing = (initial = '') =>
    renderHook(({ value }) => useSearchTerm(value), { initialProps: { value: initial } });

  it('requests nothing for 0–2 meaningful characters', () => {
    const { result, rerender } = typing();
    expect(result.current).toMatchObject({ term: '', state: 'empty' });
    for (const value of ['ر', 'رب', ' ر ب ', 'می‌']) {
      rerender({ value });
      act(() => vi.advanceTimersByTime(1000));
      expect(result.current).toMatchObject({ term: '', state: 'short' });
    }
  });

  it('settles 300ms after the last change, so fast typing yields only the last text', () => {
    const { result, rerender } = typing();
    for (const value of ['خود', 'خودک', 'خودکا', 'خودکار']) {
      rerender({ value });
      act(() => vi.advanceTimersByTime(299));
      expect(result.current).toMatchObject({ term: '', state: 'waiting' });
    }
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toMatchObject({ term: 'خودکار', state: 'ready' });
    rerender({ value: 'خودکار آبی' });
    expect(result.current).toMatchObject({ term: 'خودکار', state: 'waiting' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toMatchObject({ term: 'خودکار آبی', state: 'ready' });
  });

  it('drops the previous term below the minimum and starts over', () => {
    const { result, rerender } = typing('مداد');
    expect(result.current).toMatchObject({ term: 'مداد', state: 'ready' });
    rerender({ value: 'مد' });
    expect(result.current).toMatchObject({ term: '', state: 'short' });
    act(() => vi.advanceTimersByTime(0));
    rerender({ value: 'مداد' });
    expect(result.current).toMatchObject({ term: '', state: 'waiting' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.term).toBe('مداد');
  });

  it('flush settles an explicit submission (scanner Enter) without the debounce', () => {
    const { result, rerender } = typing();
    rerender({ value: '6261234567890' });
    expect(result.current.state).toBe('waiting');
    act(() => result.current.flush());
    expect(result.current).toMatchObject({ term: '6261234567890', state: 'ready' });
  });

  it('keeps the same object while nothing changes', () => {
    const { result, rerender } = typing('دفتر');
    const first = result.current;
    rerender({ value: 'دفتر ' });
    expect(result.current).toBe(first);
  });
});
