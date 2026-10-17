import { describe, expect, it, vi } from 'vitest';
import { render } from '@dukani/i18n/testing';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { SearchAutocomplete } from './SearchAutocomplete';
describe('search suggestion keyboard contract', () => {
  it('keeps focus in the input and selects a suggestion with ArrowDown/Enter', async () => {
    const select = vi.fn();
    const user = userEvent.setup();
    render(
      <SearchAutocomplete
        label="Find product"
        value="Pen"
        suggestions={[
          { id: 'a', label: 'Blue pen' },
          { id: 'b', label: 'Red pen' },
        ]}
        onSelect={select}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(select).toHaveBeenCalledWith('b');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
  it('closes with Escape and exposes an accessible open list', async () => {
    const user = userEvent.setup();
    render(
      <SearchAutocomplete
        label="Find product"
        suggestions={[{ id: 'a', label: 'Pen' }]}
        onSelect={() => {}}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeVisible();
    const result = await axe.run(document.body, {
      rules: { region: { enabled: false }, 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('shows the notice in the popup while there is nothing to choose', async () => {
    const user = userEvent.setup();
    render(
      <SearchAutocomplete
        label="Find product"
        value="Pe"
        suggestions={[]}
        notice="Type 3 letters"
        onSelect={() => {}}
      />,
    );
    expect(screen.queryByRole('status')).toBeNull();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('status')).toHaveTextContent('Type 3 letters');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('status')).toBeNull();
  });
});
