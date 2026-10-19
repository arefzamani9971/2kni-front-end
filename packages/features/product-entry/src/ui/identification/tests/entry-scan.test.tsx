import { render } from '@dukani/i18n/testing';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as Platform from '@dukani/platform';
import { EntryScanScreen } from '../screens/EntryScanScreen';

const mocks = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
}));
vi.mock('../../common/hooks/use-entry-nav', () => ({
  useEntryNav: () => ({ method: vi.fn(), nav: { push: mocks.push, replace: vi.fn() } }),
}));

/** Scanner keys a few ms apart: fixed stamps, so a slow (loaded) test run is never read as a person typing. */
const scan = (code: string, target: HTMLElement = document.body) => {
  const keys = [...code].map((char) => ({ key: char, code: /\d/.test(char) ? `Digit${char}` : '' }));
  [...keys, { key: 'Enter', code: 'Enter' }].forEach((init, i) => {
    const event = new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true });
    Object.defineProperty(event, 'timeStamp', { value: i * 5 });
    fireEvent(target, event);
  });
};

beforeEach(() => mocks.push.mockReset());

describe('entry scan screen (F08) on the shared scan hooks', () => {
  it('a hardware scan goes to the lookup with no button, keeping leading zeros', () => {
    render(<EntryScanScreen />);
    expect(screen.getByText('بارکدخوان آماده است')).toBeInTheDocument();
    act(() => scan('00123457'));
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith('/s/store/entry/search?q=00123457&origin=hardware');
  });

  it('an invalid scan sends nothing and says why', () => {
    render(<EntryScanScreen />);
    act(() => scan('4006381333932'));
    expect(mocks.push).not.toHaveBeenCalled();
    expect(screen.getByText('بارکد نامعتبر است؛ قالب و رقم کنترل را بررسی کنید.')).toHaveAttribute(
      'role',
      'status',
    );
  });

  it('keys pressed on a focused button are not taken for a scan by the button itself', async () => {
    const user = userEvent.setup();
    render(<EntryScanScreen />);
    // the camera permission prompt is open; its focused button must not receive the scanner's Enter
    const manual = screen.getAllByRole('button', { name: 'ورود دستی بارکد' })[0]!;
    manual.focus();
    act(() => scan('00123457', manual));
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith('/s/store/entry/search?q=00123457&origin=hardware');
    expect(screen.queryByRole('textbox', { name: /بارکد/ })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
  });
});
