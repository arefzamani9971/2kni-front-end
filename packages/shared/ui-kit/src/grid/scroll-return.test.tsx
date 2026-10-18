import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useScrollReturn } from './use-scroll-return';

/** A list whose top card is «b» while scrolled; `data-top` shows where a return brought it. */
function List({ label = 'کالاها', rows = ['a', 'b', 'c'] }: { label?: string; rows?: readonly string[] }) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [top, setTop] = useState('start');
  useScrollReturn({
    scroller: element,
    ready: !!element,
    rowCount: rows.length,
    label,
    anchor: () => ({ id: 'b', index: 1 }),
    scrollToAnchor: (anchor) => {
      const found = rows.includes(anchor.id);
      setTop(found ? anchor.id : `near ${Math.min(anchor.index, rows.length - 1)}`);
      return found;
    },
  });
  return <div ref={setElement} data-testid="list" data-top={top} style={{ overflowY: 'auto' }} />;
}
const scrolled = (label?: string) => {
  const view = render(<List label={label} />);
  fireEvent.scroll(screen.getByTestId('list'));
  view.unmount();
};
const back = () =>
  act(() => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

afterEach(() => {
  sessionStorage.clear();
  vi.useRealTimers();
});

describe('card list return context (PAT-LIST-02)', () => {
  it('Back brings back the card that was at the top; a fresh visit starts at the top', () => {
    scrolled();
    const fresh = render(<List />); // a link, not Back
    expect(screen.getByTestId('list')).toHaveAttribute('data-top', 'start');
    fresh.unmount();
    back();
    const returned = render(<List />);
    expect(screen.getByTestId('list')).toHaveAttribute('data-top', 'b');
    returned.unmount();
    render(<List />); // the return was used once
    expect(screen.getByTestId('list')).toHaveAttribute('data-top', 'start');
  });

  it('a list the router shows a moment before Back/Forward is a return too', () => {
    scrolled();
    render(<List />);
    expect(screen.getByTestId('list')).toHaveAttribute('data-top', 'start');
    back();
    expect(screen.getByTestId('list')).toHaveAttribute('data-top', 'b');
  });

  it('a list shown long before a later Back stays where it is', () => {
    vi.useFakeTimers();
    scrolled();
    render(<List />);
    act(() => vi.advanceTimersByTime(1000));
    back();
    expect(screen.getByTestId('list')).toHaveAttribute('data-top', 'start');
  });

  it('waits for its card to be loaded, going to the nearest position meanwhile; lists keep their own anchor', () => {
    scrolled();
    back();
    const view = render(<List rows={['a']} />);
    expect(screen.getByTestId('list')).toHaveAttribute('data-top', 'near 0');
    view.rerender(<List rows={['a', 'b']} />);
    expect(screen.getByTestId('list')).toHaveAttribute('data-top', 'b');
    view.unmount();
    back();
    render(<List label="خدمات" />);
    expect(screen.getByTestId('list')).toHaveAttribute('data-top', 'start');
  });
});
