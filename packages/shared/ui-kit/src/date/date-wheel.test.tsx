import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import { describe, expect, it, vi } from 'vitest';
import { DateWheel } from './DateWheel';

describe('date wheel scroll ownership', () => {
  it('does not treat programmatic opening scroll as a user choice', async () => {
    const onChange = vi.fn();
    const settling = vi.fn();
    render(
      <DateWheel
        label="Day"
        part="day"
        value={5}
        values={[1, 2, 3, 4, 5, 6, 7]}
        format={String}
        onChange={onChange}
        onSettlingChange={settling}
      />,
    );
    const wheel = screen.getByRole('spinbutton');
    fireEvent.scroll(wheel, { target: { scrollTop: 0 } });
    expect(wheel.scrollTop).toBe(4 * 48);
    expect(onChange).not.toHaveBeenCalled();
    expect(settling).not.toHaveBeenCalledWith('day', true);
    fireEvent.wheel(wheel);
    fireEvent.scroll(wheel, { target: { scrollTop: 6 * 48 } });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('day', 7));
  });
});
